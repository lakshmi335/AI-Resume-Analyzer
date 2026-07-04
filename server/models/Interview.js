const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  jobRole: { type: String, required: true },
  jobDescription: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  messages: [messageSchema],
  feedback: {
    overallScore: Number, communication: Number, technicalKnowledge: Number,
    problemSolving: Number, confidence: Number, summary: String,
    hireable: Boolean, strengths: [String], improvements: [String],
    communicationFeedback: String, technicalFeedback: String,
    problemSolvingFeedback: String, confidenceFeedback: String,
    questionAnalysis: [{ question: String, answerQuality: String, score: Number, feedback: String }],
    recommendedResources: [String], nextSteps: [String],
  },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
