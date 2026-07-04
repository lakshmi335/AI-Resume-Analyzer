const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const { callAI, parseAIJson } = require('../utils/aiHelper');
const { getInterviewSystemPrompt, getInterviewFeedbackPrompt } = require('../utils/promptTemplates');

const startInterview = async (req, res, next) => {
  try {
    const { jobRole, jobDescription, resumeId, difficulty = 'medium' } = req.body;
    if (!jobRole) return res.status(400).json({ error: 'Job role is required' });

    let resumeText = '';
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
      if (resume) resumeText = resume.originalText;
    }

    const systemPrompt = getInterviewSystemPrompt(jobRole, jobDescription, resumeText, difficulty);
    const aiResponse = await callAI([{ role: 'user', content: 'Start the interview' }], systemPrompt, 500);

    const interview = await Interview.create({
      user: req.user.id, resume: resumeId || undefined, jobRole,
      jobDescription: jobDescription || '', difficulty,
      messages: [{ role: 'assistant', content: aiResponse }], status: 'active',
    });

    res.status(201).json({ interview });
  } catch (error) { next(error); }
};

const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id, status: 'active' }).populate('resume', 'originalText');
    if (!interview) return res.status(404).json({ error: 'Interview not found or already completed' });

    interview.messages.push({ role: 'user', content: message });
    const systemPrompt = getInterviewSystemPrompt(interview.jobRole, interview.jobDescription, interview.resume?.originalText || '', interview.difficulty);
    const aiMessages = interview.messages.map(m => ({ role: m.role, content: m.content }));
    const aiResponse = await callAI(aiMessages, systemPrompt, 500);

    interview.messages.push({ role: 'assistant', content: aiResponse });
    await interview.save();

    res.json({ message: aiResponse, interviewId: interview._id });
  } catch (error) { next(error); }
};

const endInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (interview.messages.length < 3) return res.status(400).json({ error: 'Interview too short to analyze' });

    const feedbackPrompt = getInterviewFeedbackPrompt(interview.messages, interview.jobRole);
    const aiResponse = await callAI([{ role: 'user', content: feedbackPrompt }], '', 1500);
    const feedback = parseAIJson(aiResponse);

    interview.feedback = feedback;
    interview.status = 'completed';
    await interview.save();

    res.json({ interview });
  } catch (error) { next(error); }
};

const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user.id }).select('-messages').sort({ createdAt: -1 });
    res.json({ interviews });
  } catch (error) { next(error); }
};

const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ interview });
  } catch (error) { next(error); }
};

module.exports = { startInterview, sendMessage, endInterview, getInterviews, getInterview };
