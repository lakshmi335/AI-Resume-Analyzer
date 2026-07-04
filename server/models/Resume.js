const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalText: { type: String, required: true },
  jobDescription: { type: String, default: '' },
  analysis: {
    overallScore: Number,
    atsScore: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    keywords: { matched: [String], missing: [String] },
    sections: {
      contact: { score: Number, feedback: String },
      summary: { score: Number, feedback: String },
      experience: { score: Number, feedback: String },
      education: { score: Number, feedback: String },
      skills: { score: Number, feedback: String },
    },
    formatFeedback: String,
    suitableRoles: [{
      title: String, match: Number, level: String,
      reason: String, skills: [String], avgSalary: String,
    }],
    rawAnalysis: String,
  },
  status: { type: String, enum: ['pending', 'analyzing', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
