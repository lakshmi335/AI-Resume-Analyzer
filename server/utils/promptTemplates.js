const getResumeAnalysisPrompt = (resumeText, jobDescription = '') => {
  const jobContext = jobDescription ? `\n\nJOB DESCRIPTION:\n${jobDescription}` : '';
  return `You are an expert ATS resume reviewer. Analyze the resume and return ONLY a valid JSON object with no extra text, no markdown, no explanations.

RESUME:
${resumeText}
${jobContext}

Return ONLY this JSON:
{
  "overallScore": 75,
  "atsScore": 70,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "keywords": { "matched": ["keyword1"], "missing": ["keyword1"] },
  "sections": {
    "contact":    { "score": 80, "feedback": "feedback here" },
    "summary":    { "score": 70, "feedback": "feedback here" },
    "experience": { "score": 75, "feedback": "feedback here" },
    "education":  { "score": 80, "feedback": "feedback here" },
    "skills":     { "score": 70, "feedback": "feedback here" }
  },
  "formatFeedback": "feedback about format here",
  "suitableRoles": [
    { "title": "Job Title 1", "match": 92, "level": "Senior", "reason": "why this fits", "skills": ["skill1","skill2","skill3"], "avgSalary": "$90,000 - $120,000" },
    { "title": "Job Title 2", "match": 85, "level": "Mid", "reason": "why this fits", "skills": ["skill1","skill2","skill3"], "avgSalary": "$80,000 - $100,000" },
    { "title": "Job Title 3", "match": 80, "level": "Mid", "reason": "why this fits", "skills": ["skill1","skill2","skill3"], "avgSalary": "$75,000 - $95,000" },
    { "title": "Job Title 4", "match": 75, "level": "Junior", "reason": "why this fits", "skills": ["skill1","skill2","skill3"], "avgSalary": "$60,000 - $80,000" },
    { "title": "Job Title 5", "match": 70, "level": "Senior", "reason": "why this fits", "skills": ["skill1","skill2","skill3"], "avgSalary": "$100,000 - $130,000" }
  ]
}
Rules: Return ONLY JSON. No markdown. No extra text. Do NOT ask questions. Provide exactly 5 suitable roles based on actual resume skills.`;
};

const getInterviewSystemPrompt = (jobRole, jobDescription, resumeText, difficulty) => {
  const guide = {
    easy: 'Ask simple background and behavioral questions. Be encouraging.',
    medium: 'Mix behavioral and technical questions with follow-ups.',
    hard: 'Ask challenging technical and situational questions.',
  };
  return `You are an interviewer conducting a mock interview for a ${jobRole} position.
${jobDescription ? `JOB: ${jobDescription}\n` : ''}${resumeText ? `RESUME: ${resumeText}\n` : ''}
DIFFICULTY: ${difficulty} - ${guide[difficulty]}
Rules:
- Ask ONE question at a time
- Keep responses under 3 sentences
- Be professional and conversational
- Do NOT ask for dates, times, or personal info
- Start with a warm introduction and your first question immediately`;
};

const getInterviewFeedbackPrompt = (messages, jobRole) => {
  const conversation = messages.map(m => `${m.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER'}: ${m.content}`).join('\n\n');
  return `You are a senior interview coach. Analyze this mock interview for a ${jobRole} position.

TRANSCRIPT:
${conversation}

Return ONLY a valid JSON object with NO extra text, NO markdown:
{
  "overallScore": 75,
  "communication": 80,
  "technicalKnowledge": 70,
  "problemSolving": 75,
  "confidence": 70,
  "summary": "3-4 sentence honest overall assessment",
  "hireable": true,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3", "improvement4", "improvement5"],
  "communicationFeedback": "2-3 sentences about communication",
  "technicalFeedback": "2-3 sentences about technical knowledge",
  "problemSolvingFeedback": "2-3 sentences about problem solving",
  "confidenceFeedback": "2-3 sentences about confidence",
  "questionAnalysis": [{ "question": "question text", "answerQuality": "good", "score": 80, "feedback": "feedback" }],
  "recommendedResources": ["resource1", "resource2", "resource3"],
  "nextSteps": ["step1", "step2", "step3"]
}
Rules: Be honest and specific. answerQuality must be good, average, or poor. Return ONLY JSON.`;
};

const getComparisonPrompt = (resume1Text, resume2Text, jobDescription = '') => {
  return `Compare these two resumes${jobDescription ? ' for this role: ' + jobDescription : ''} and return ONLY a valid JSON object.

RESUME 1:
${resume1Text}

RESUME 2:
${resume2Text}

Return ONLY this JSON:
{
  "resume1": { "score": 75, "strengths": ["s1","s2","s3"], "weaknesses": ["w1","w2"] },
  "resume2": { "score": 70, "strengths": ["s1","s2","s3"], "weaknesses": ["w1","w2"] },
  "recommendation": "2-3 sentences on which is stronger and why",
  "winner": 1
}
Return ONLY the JSON, no extra text.`;
};

const getResumeBuildPrompt = (jobDescription, userInfo) => {
  return `You are a professional resume writer. Create a complete ATS-optimized resume tailored to the job description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE INFO:
Name: ${userInfo.name || 'Your Name'}
Skills: ${userInfo.skills || 'Not provided'}
Experience: ${userInfo.experience || 'Not provided'}
Education: ${userInfo.education || 'Not provided'}

Write a complete professional resume in plain text with these sections:
1. Contact Information
2. Professional Summary (3-4 lines tailored to the job)
3. Technical Skills (match keywords from job description)
4. Work Experience (bullet points with action verbs and metrics)
5. Education
6. Certifications (if relevant)

Rules:
- Use keywords directly from the job description for ATS optimization
- Write strong action-verb bullet points with quantified achievements
- Make it specific to the job role
- Return ONLY the resume text, no extra commentary`;
};

module.exports = {
  getResumeAnalysisPrompt,
  getInterviewSystemPrompt,
  getInterviewFeedbackPrompt,
  getComparisonPrompt,
  getResumeBuildPrompt,
};
