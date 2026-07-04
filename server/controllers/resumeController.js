const multer = require('multer');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { extractTextFromPDF, cleanResumeText } = require('../utils/pdfParser');
const { callAI, parseAIJson } = require('../utils/aiHelper');
const { getResumeAnalysisPrompt, getComparisonPrompt, getResumeBuildPrompt } = require('../utils/promptTemplates');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  },
});

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file' });
    const { jobDescription } = req.body;
    const { success, text, error: parseError } = await extractTextFromPDF(req.file.buffer);
    if (!success || !text) return res.status(400).json({ error: parseError || 'Could not extract text from PDF' });

    const cleanText = cleanResumeText(text);
    const resume = await Resume.create({
      user: req.user.id, fileName: req.file.originalname, originalText: cleanText,
      jobDescription: jobDescription || '', status: 'analyzing',
    });
    await User.findByIdAndUpdate(req.user.id, { $push: { resumes: resume._id } });

    const prompt = getResumeAnalysisPrompt(cleanText, jobDescription);
    const aiResponse = await callAI([{ role: 'user', content: prompt }], '', 2500);
    const analysis = parseAIJson(aiResponse);

    resume.analysis = { ...analysis, rawAnalysis: aiResponse };
    resume.status = 'completed';
    await resume.save();

    res.status(201).json({ resume });
  } catch (error) { next(error); }
};

const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).select('-originalText -analysis.rawAnalysis').sort({ createdAt: -1 });
    res.json({ resumes });
  } catch (error) { next(error); }
};

const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ resume });
  } catch (error) { next(error); }
};

const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    await User.findByIdAndUpdate(req.user.id, { $pull: { resumes: resume._id } });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) { next(error); }
};

const compareResumes = async (req, res, next) => {
  try {
    const { resumeId1, resumeId2, jobDescription } = req.body;
    if (!resumeId1 || !resumeId2) return res.status(400).json({ error: 'Please provide two resume IDs' });
    const [resume1, resume2] = await Promise.all([
      Resume.findOne({ _id: resumeId1, user: req.user.id }),
      Resume.findOne({ _id: resumeId2, user: req.user.id }),
    ]);
    if (!resume1 || !resume2) return res.status(404).json({ error: 'One or both resumes not found' });

    const prompt = getComparisonPrompt(resume1.originalText, resume2.originalText, jobDescription);
    const aiResponse = await callAI([{ role: 'user', content: prompt }], '', 1500);
    const comparison = parseAIJson(aiResponse);

    res.json({ comparison, resume1: { id: resume1._id, fileName: resume1.fileName }, resume2: { id: resume2._id, fileName: resume2.fileName } });
  } catch (error) { next(error); }
};

const buildResume = async (req, res, next) => {
  try {
    const { jobDescription, name, skills, experience, education } = req.body;
    if (!jobDescription?.trim()) return res.status(400).json({ error: 'Job description is required' });
    const prompt = getResumeBuildPrompt(jobDescription, { name, skills, experience, education });
    const resume = await callAI([{ role: 'user', content: prompt }], '', 2000);
    res.json({ resume });
  } catch (error) { next(error); }
};

module.exports = { upload, uploadResume, getResumes, getResume, deleteResume, compareResumes, buildResume };
