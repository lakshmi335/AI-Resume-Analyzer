 AI Resume Analyzer
Smart Resume Analysis · Job Role Matching · Voice-Powered Mock Interviews

I built an AI-powered Resume Analyzer — a full-stack MERN application where users upload their resume to receive ATS scoring, keyword analysis, and AI-recommended job roles. It also includes a voice-enabled mock interview feature where an AI interviewer conducts real conversations, followed by a detailed performance report with skill scores and improvement suggestions. The project uses React, Node.js, MongoDB, JWT authentication, and integrates a Large Language Model via OpenRouter API with custom prompt engineering.

A full-stack AI-powered platform that analyzes resumes, recommends suitable job roles, and conducts voice-enabled mock interviews — giving job seekers a complete preparation toolkit.

Features · Demo · Setup · Tech Stack · API · Contributing

</div>
📌 Project Overview
Most job seekers face three problems:

Resume Quality — No idea if their resume will pass ATS (Applicant Tracking System) screening
Role Confusion — Unsure which job roles match their actual skills
Interview Fear — No realistic practice before the real interview
AI Resume Analyzer solves all three in one platform:

Upload your resume → get AI-powered ATS scoring, section-by-section feedback, keyword analysis, and 5 suitable job roles ranked by match percentage
Practice mock interviews with an AI interviewer using voice input and output
Receive a detailed performance report with grades, skill scores, and improvement suggestions
Build a tailored resume from any job description in seconds
✨ Features
📄 Resume Analysis
Upload PDF resume (drag & drop or click)
AI extracts and analyzes text automatically
Overall Score and ATS Compatibility Score (0–100)
Section-by-section feedback: Contact, Summary, Experience, Education, Skills
Strengths, weaknesses, and actionable suggestions
Keyword matching against job description (matched vs. missing)
Format and layout feedback
Radar chart visualization of section scores
🎯 Suitable Job Role Recommendations
AI recommends 5 roles based on actual resume content
Each role shows: match %, experience level (Junior/Mid/Senior), salary range, required skills, reason for recommendation
One-click "Find Jobs on LinkedIn" button per role
🎤 Voice-Enabled Mock Interview
Choose job role, difficulty (Easy / Medium / Hard), and optional resume context
AI acts as a professional interviewer — asks relevant questions one at a time
Voice input: speak your answers using browser Speech-to-Text
Voice output: AI reads questions aloud using Text-to-Speech
Replay any question, toggle voice on/off
Full conversation history preserved
📊 Interview Performance Analysis
After the interview ends, get a complete report:

Letter grade (A+ to D) + overall score
Four skill scores: Communication, Technical Knowledge, Problem Solving, Confidence
Radar chart + horizontal bar chart
Q&A Review: every question scored individually with feedback
Hireability assessment (Likely Hireable / Needs More Preparation)
Priority improvements, next steps, recommended resources
Full interview transcript
🤖 AI Resume Builder
Paste any job description
Add your name, skills, experience, education (all optional)
AI writes a complete ATS-optimized resume tailored to the role
Copy to clipboard or download as .txt
⚖️ Resume Comparison
Compare two resumes side-by-side
AI scores both and picks the stronger one
Explains strengths and weaknesses of each
📱 Dashboard
Stats: total resumes analyzed, interviews completed, average score
Horizontal slider to browse through recent resumes and interviews
Quick action cards for all features
🛠 Tech Stack
Frontend
Technology	Purpose
React 18	Component-based UI
React Router v6	Client-side navigation
Axios	HTTP API calls with JWT interceptor
Recharts	Radar and bar charts for scores
React Dropzone	Drag-and-drop PDF upload
Lucide React	Icon library
Web Speech API	Browser-native speech-to-text (free)
SpeechSynthesis API	Browser-native text-to-speech (free)
Context API	Global authentication state
Plain CSS	Custom dark theme (no CSS framework)
Backend
Technology	Purpose
Node.js	JavaScript runtime
Express.js	Web framework and routing
MongoDB Atlas	Cloud NoSQL database
Mongoose	MongoDB ODM
JWT	Stateless authentication tokens
bcryptjs	Password hashing
Multer	In-memory file upload handling
pdf-parse	PDF text extraction
OpenRouter API	AI model access (free tier)
Helmet	HTTP security headers
CORS	Cross-origin request handling
express-rate-limit	API rate limiting
AI / NLP
Technique	Usage
Prompt Engineering	Structured JSON responses from LLM
Text Extraction	PDF → plain text via pdf-parse
Keyword Extraction	Resume vs. job description matching
Text Classification	Section-wise resume scoring
Semantic Similarity	Resume-to-job-description relevance
Text Summarization	Concise feedback generation
NLG	Resume builder + interview questions
Conversational AI	Multi-turn interview with context
ASR / TTS	Browser-native voice I/O
📁 Project Structure

ai-resume-analyzer/
├── client/                          # React Frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── api/
│       │   ├── axios.js             # Axios instance + JWT interceptor
│       │   └── requests.js          # authAPI, resumeAPI, interviewAPI
│       ├── components/
│       │   ├── Navbar.js            # Navigation bar
│       │   ├── Spinner.js           # Loading indicator
│       │   ├── FileUpload.js        # Drag-and-drop PDF uploader
│       │   ├── ResultCard.js        # Resume analysis display
│       │   └── JobRoles.js          # Suitable roles component
│       ├── context/
│       │   └── AuthContext.js       # JWT state management
│       ├── pages/
│       │   ├── AuthPage.js          # Login + Register
│       │   ├── Dashboard.js         # Home with sliders
│       │   ├── UploadPage.js        # Analyze + Build resume
│       │   ├── InterviewPage.js     # Mock interview + analysis
│       │   ├── ComparePage.js       # Resume comparison
│       │   └── ResumeDetail.js      # View saved analysis
│       ├── App.js                   # Routes + AuthProvider
│       ├── index.js                 # React entry point
│       └── index.css                # Global dark theme styles
│
├── server/                          # Node.js Backend
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile
│   │   ├── resumeController.js      # Upload, analyze, compare, build
│   │   └── interviewController.js   # Start, chat, end, feedback
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT protect middleware
│   │   └── errorHandler.js          # Global error handler
│   ├── models/
│   │   ├── User.js                  # User schema (bcrypt)
│   │   ├── Resume.js                # Resume + analysis schema
│   │   └── Interview.js             # Interview messages + feedback
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── resumeRoutes.js          # /api/resume/*
│   │   └── interviewRoutes.js       # /api/interview/*
│   ├── utils/
│   │   ├── aiHelper.js              # OpenRouter API wrapper
│   │   ├── pdfParser.js             # PDF text extraction
│   │   └── promptTemplates.js       # All AI prompt builders
│   ├── server.js                    # Express entry point
│   ├── package.json
│   └── .env.example                 # Environment variable template
│
├── .gitignore
└── README.md
🚀 Getting Started
Prerequisites
Node.js v18+ (download)
Git (download)
MongoDB Atlas free account (sign up)
OpenRouter free API key (sign up)
1. Clone the Repository

bash
git clone https://github.com/lakshmi335/ai-resume-analyzer.git
cd ai-resume-analyzer
2. Set Up the Backend

bash
cd server
npm install
Create your .env file:


bash
cp .env.example .env
Edit .env with your values:


env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-resume-analyzer

# JWT - use any long random string
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# OpenRouter API key (free tier available)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Frontend URL
CLIENT_URL=http://localhost:3000
Start the backend:


bash
npm run dev
You should see:


Server running on port 5000 in development mode
MongoDB connected: cluster.mongodb.net
3. Set Up the Frontend
Open a new terminal:


bash
cd client
npm install
npm start
The app opens at http://localhost:3000

🔑 Environment Variables
Variable	Required	Description
PORT	Yes	Server port (default: 5000)
NODE_ENV	Yes	development or production
MONGODB_URI	Yes	MongoDB Atlas connection string
JWT_SECRET	Yes	Secret key for JWT signing (min 32 chars)
JWT_EXPIRES_IN	No	Token expiry (default: 7d)
OPENROUTER_API_KEY	Yes	Free API key from openrouter.ai
CLIENT_URL	Yes	Frontend URL for CORS
📡 API Reference
Authentication
Method	Endpoint	Description	Auth
POST	/api/auth/register	Register new user	No
POST	/api/auth/login	Login user	No
GET	/api/auth/me	Get current user	Yes
PUT	/api/auth/profile	Update profile	Yes
Resume
Method	Endpoint	Description	Auth
POST	/api/resume/upload	Upload + analyze PDF	Yes
GET	/api/resume	Get all user resumes	Yes
GET	/api/resume/:id	Get single resume	Yes
DELETE	/api/resume/:id	Delete resume	Yes
POST	/api/resume/compare	Compare two resumes	Yes
POST	/api/resume/build	Build resume from JD	Yes
Interview
Method	Endpoint	Description	Auth
POST	/api/interview/start	Start new interview	Yes
POST	/api/interview/:id/message	Send answer	Yes
POST	/api/interview/:id/end	End + get feedback	Yes
GET	/api/interview	Get all interviews	Yes
GET	/api/interview/:id	Get single interview	Yes
Request Examples
Login:


json
POST /api/auth/login
{
  "email": "jane@example.com",
  "password": "yourpassword"
}
Upload Resume:


POST /api/resume/upload
Content-Type: multipart/form-data

resume: [PDF file]
jobDescription: "Optional job description text"
Start Interview:


json
POST /api/interview/start
{
  "jobRole": "Frontend Developer",
  "difficulty": "medium",
  "resumeId": "optional-resume-id",
  "jobDescription": "optional job description"
}
🔄 How It Works
Resume Analysis Flow

User uploads PDF
      ↓
Multer receives file in memory (never saved to disk)
      ↓
pdf-parse extracts raw text
      ↓
cleanResumeText() normalizes whitespace/formatting
      ↓
promptTemplates.getResumeAnalysisPrompt() builds AI instruction
      ↓
aiHelper.callAI() sends to OpenRouter → Gemma model
      ↓
AI returns structured JSON (scores, roles, keywords, feedback)
      ↓
parseAIJson() safely parses the response
      ↓
Saved to MongoDB → returned to frontend
      ↓
ResultCard.js renders charts + suitable roles
Interview Flow

User sets up interview (role + difficulty)
      ↓
System prompt built → AI starts as interviewer
      ↓
[Loop] User answers → full conversation resent to AI → next question
      ↓
AI maintains context because full history is sent every turn
      ↓
User ends interview → transcript sent to AI for evaluation
      ↓
AI returns JSON feedback (scores, Q&A review, improvements)
      ↓
Performance report rendered with charts and tabs
🔒 Security
Passwords hashed with bcrypt (salt rounds: 12)
JWT tokens for stateless authentication — verified on every protected route
PDFs processed in memory — never written to disk
Rate limiting: 100 requests per 15 minutes per IP
Helmet sets secure HTTP headers
CORS configured to only allow the frontend origin
AI API keys stored server-side in .env — never exposed to the browser
🧠 NLP Techniques Used
This project uses a pre-trained Large Language Model (Google Gemma via OpenRouter) with carefully engineered prompts to perform NLP tasks:

NLP Technique	Implementation
Text Extraction	pdf-parse library extracts unstructured PDF text
Text Normalization	Regex-based cleaning of whitespace/line breaks
Prompt Engineering	Structured JSON prompts guide the LLM reliably
Keyword Extraction	Resume vs. job description keyword matching
Text Classification	Section-wise resume scoring (0–100 per section)
Semantic Similarity	Resume-to-job-description relevance matching
Text Summarization	Concise AI feedback from long resume content
NLG	Resume builder generates tailored professional content
Conversational AI	Multi-turn interview with full context history
ASR / TTS	Browser-native Web Speech + SpeechSynthesis APIs
⚠️ Known Limitations
Voice input (Speech-to-Text) works best in Chrome and Edge browsers
AI responses depend on OpenRouter's free tier — may be slower during peak times
PDF parsing works best with text-based PDFs; image-only/scanned PDFs may not extract well
Free OpenRouter models have token limits — very long resumes may be truncated
🔮 Future Improvements
 Export analysis as downloadable PDF report
 Email notifications for results and reminders
 Multi-language resume and interview support
 Resume version history and score tracking over time
 Live job board integration (pull real job postings)
 Webcam-based interview with body language analysis
 Fine-tuned model specifically for resume scoring
 Admin analytics dashboard (anonymized usage trends)
 Mobile app (React Native)
🤝 Contributing
Contributions are welcome!


bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git commit -m "Add: your feature description"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Open a Pull Request
Please make sure your code follows the existing style and all features work before submitting a PR.

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

👩‍💻 Author
DhanaLakshmi B.Tech Data Science — Aditya University

GitHub: Lakshmi335
LinkedIn: https://www.linkedin.com/in/dhanalakshmi-kolipakula-32998231b/
<div align="center">
⭐ If this project helped you, please give it a star!

Built with passion using React, Node.js, MongoDB, and AI

</div>
