# AI Resume Analyzer & Career OS

**Smart Resume Analysis · Job Role Matching · Voice-Powered Mock Interviews**

A full-stack MERN application where users upload a resume and get an ATS score, section-by-section feedback, keyword gap analysis and AI-recommended job roles. It also includes an AI mock interviewer with voice input, voice output and camera monitoring, followed by a detailed performance report.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Setup](#-setup) · [API](#-api-reference) · [How It Works](#-how-it-works) · [Security](#-security) · [Limitations](#-known-limitations)

---

## 📌 Project Overview

Most job seekers face three problems:

1. **Resume quality**: no idea whether their resume will pass ATS (Applicant Tracking System) screening
2. **Role confusion**: unsure which job roles match their actual skills
3. **Interview fear**: no realistic practice before the real interview

AI Resume Analyzer & Career OS addresses all three in one platform:

- Upload a resume and get an AI-powered ATS score, section feedback, keyword analysis and suggested job roles
- Practice mock interviews with an AI interviewer using voice or text
- Receive a performance report with scores, charts and improvement suggestions

## ✨ Features

### 📄 Resume Analysis
- Upload PDF, DOCX or TXT resumes (drag and drop or browse) with type, size and empty-file validation
- Overall ATS score plus six category scores: ATS compatibility, keyword match, skills match, experience relevance, formatting and content quality
- Pass / warning / fail score checklist and a category bar chart
- Section-by-section analysis (contact, summary, education, skills, experience, projects, certifications, achievements) with issues and suggestions
- Strengths, weaknesses and prioritised recommendations (critical, high, medium, optional)
- Keyword analysis with matching, missing and recommended keywords, plus technical and soft skill extraction

### 🎯 Job Description Matching
- Paste a job title and description to get an overall match percentage
- Matching vs. missing keywords for that specific role

### 💼 Recommended Job Roles
- AI suggests 3 to 5 roles that fit the candidate's actual skills and experience level
- One-click search links for each role on **LinkedIn, Naukri, Internshala and Unstop**

### ✍️ Resume Writing Tools
- **Bullet point improver**: before and after rewrite with copy and regenerate
- **Professional summary generator** from the resume and an optional target role or job description
- **Resume comparison**: two resumes scored side by side, with a winner and the reasoning

### 🎤 Mock Interview
- Choose job role, difficulty (easy, medium, hard), job description and an optional resume for personalised questions
- AI interviewer asks one question at a time and adapts to your answers
- **Voice input**: dictate answers with the browser Speech-to-Text API
- **Voice output**: questions read aloud with Text-to-Speech (toggle on or off)
- **Camera monitoring** with on-device **multi-person detection** (TensorFlow.js BlazeFace) and a warning when more than one person is in frame

### 📊 Interview Performance Report
- Overall score plus Communication, Technical Knowledge, Problem Solving and Confidence scores
- Radar chart and bar chart
- Hireability assessment, strengths and improvement areas
- Question-by-question review with individual scores and feedback
- Recommended resources, next steps and the full transcript
- Reports are saved to MongoDB and can be reopened at any time

### 🧭 Dashboard and Account
- Public landing page for new visitors
- Register, login, **forgot password / reset password** and profile update
- Dashboard with stats, ATS score history chart and recent activity
- Career insights built from your analysed resumes and interviews
- **Light and dark theme** toggle, responsive layout and a slide-out navigation menu

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 (Create React App) | Component-based UI |
| React Router v6 | Client-side routing and protected routes |
| Axios | API calls with JWT interceptor |
| Recharts | Bar and radar charts |
| Lucide React | Icons |
| Web Speech API | Browser-native speech-to-text |
| SpeechSynthesis API | Browser-native text-to-speech |
| TensorFlow.js + BlazeFace | On-device face detection for multi-person warning |
| Context API | Authentication and theme state |
| Plain CSS | Custom design system with CSS variables |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server and REST API |
| MongoDB + Mongoose | Database and ODM |
| JWT | Stateless authentication |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| pdf-parse, mammoth | PDF and DOCX text extraction |
| Nodemailer | Password reset emails (optional) |
| Google Gemini API | LLM for analysis, interview and feedback |

### AI / NLP
| Technique | Usage |
|---|---|
| Prompt engineering | Structured JSON responses from the LLM |
| Robust JSON parsing | `parseAIJson()` recovers from markdown fences, extra text and trailing commas |
| Text extraction | PDF, DOCX and TXT to plain text |
| Keyword extraction and matching | Resume vs. job description (LLM-based) |
| Section-wise scoring | 0 to 100 scores per section and category |
| Natural language generation | Bullet rewrites, summaries, interview questions |
| Conversational AI | Multi-turn interview with the full history sent each turn |
| ASR / TTS | Browser-native voice input and output |
| Computer vision | BlazeFace face detection running in the browser |

> The project uses **pre-trained models** (Google Gemini for language tasks, BlazeFace for face detection). No model is trained from scratch.

## 🚀 Setup

### Prerequisites
- [Node.js](https://nodejs.org) v18 or newer
- [Git](https://git-scm.com)
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the repository
```bash
git clone https://github.com/lakshmi335/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 2. Backend
```bash
cd server
npm install
```

Create your `.env` file (`cp .env.example .env` on macOS/Linux, `copy .env.example .env` on Windows) and fill in the values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai-resume-analyzer
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE_MB=5

# Optional: real password-reset emails
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@aicareeros.com
```

Start the server:
```bash
npm run dev
```
You should see `MongoDB connected` and `Server running on port 5000`.

### 3. Frontend
Open a new terminal:
```bash
cd client
npm install
npm start
```
Optionally create `client/.env` with `REACT_APP_API_URL=http://localhost:5000/api`. The app opens at http://localhost:3000.

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default 7d) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `GEMINI_MODEL` | No | Gemini model name. Google retires model names over time, so update this if you see a 404 |
| `CLIENT_URL` | Yes | Frontend URL for CORS and reset links |
| `MAX_FILE_SIZE_MB` | No | Upload size limit (default 5) |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | No | SMTP settings. If empty, reset links are printed to the server console |

## 📡 API Reference

All error responses use `{ "error": "message" }`.

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in | No |
| POST | `/api/auth/forgot-password` | Request a password reset link | No |
| POST | `/api/auth/reset-password/:token` | Set a new password | No |
| GET | `/api/auth/me` | Get the current user | Yes |
| PUT | `/api/auth/profile` | Update name, target role or password | Yes |

### Resume
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/resume/upload` | Upload a resume (`multipart/form-data`, field `resume`) | Yes |
| GET | `/api/resume` | List your resumes | Yes |
| GET | `/api/resume/:id` | Get one resume with its analysis | Yes |
| DELETE | `/api/resume/:id` | Delete a resume | Yes |
| POST | `/api/resume/:id/analyze` | Run AI analysis (`jobTitle` and `jobDescription` optional) | Yes |
| POST | `/api/resume/:id/bullet-improve` | Improve a bullet point | Yes |
| POST | `/api/resume/:id/generate-summary` | Generate a professional summary | Yes |
| POST | `/api/resume/compare` | Compare two resumes | Yes |

### Interview
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/interview/start` | Start an interview | Yes |
| POST | `/api/interview/:id/message` | Send an answer and get the next question | Yes |
| POST | `/api/interview/:id/end` | End the interview and generate the report | Yes |
| GET | `/api/interview` | List your interviews | Yes |
| GET | `/api/interview/:id` | Get one interview with its report | Yes |

### Request examples

```json
POST /api/auth/login
{ "email": "jane@example.com", "password": "yourpassword" }
```

```json
POST /api/interview/start
{
  "jobRole": "Frontend Developer",
  "difficulty": "medium",
  "resumeId": "optional-resume-id",
  "jobDescription": "optional job description"
}
```

## 🔄 How It Works

### Resume analysis flow
```
User uploads PDF / DOCX / TXT
        ↓
Multer validates type and size, saves the file to server/uploads
        ↓
pdf-parse / mammoth extracts the text, which is stored in MongoDB
        ↓
Prompt template builds the analysis instruction
        ↓
aiHelper sends it to Gemini (retries once if the model is overloaded)
        ↓
parseAIJson() safely parses the response and falls back to defaults if needed
        ↓
Result is saved to MongoDB and returned to the React app
        ↓
Report page renders scores, checklist, charts, keywords and job roles
```

### Interview flow
```
User sets up the interview (role, difficulty, optional resume and JD)
        ↓
AI starts as the interviewer and asks the first question
        ↓
[Loop] User answers (typed or dictated) → full history resent → next question
        ↓
User ends the interview → transcript sent for evaluation
        ↓
AI returns JSON feedback → scores are clamped to 0–100 and saved to MongoDB
        ↓
Report renders with radar chart, bar chart, Q&A review and transcript
```

## 🔒 Security

- Passwords hashed with bcrypt; password field is never returned by default
- JWT authentication verified on every protected route
- Every resume and interview query is scoped to the logged-in user, so one user cannot read another's data by guessing an ID
- MongoDB ObjectId validation on all ID parameters
- Uploads validated by type and size before parsing
- Password reset tokens are stored hashed (SHA-256), expire after 1 hour, and the forgot-password response never reveals whether an email exists
- The Gemini API key lives only in the server `.env` and is never sent to the browser
- Central error handler returns clean messages and never exposes stack traces

## ⚠️ Known Limitations

- Voice dictation works best in Chrome and Edge; Firefox and Safari do not support it, and the mic button is disabled there
- Multi-person detection downloads its model from a CDN the first time the camera is used, so it needs an internet connection. If it fails to load, the camera preview still works without the warning
- Image-only (scanned) PDFs may not extract text
- AI responses depend on the Gemini API. Model names get retired and the service can return 503 during peak demand
- No automated test suite yet
- Rate limiting and security headers (Helmet) are not added yet

## 🔮 Future Improvements

- Export the analysis as a downloadable PDF report
- AI resume builder that writes a tailored resume from a job description
- Resume version history and score tracking over time
- Live job board integration (pull real postings instead of search links)
- Rate limiting and Helmet security headers
- Multi-language resume and interview support
- Automated tests (Jest and Supertest)

## 🤝 Contributing

Contributions are welcome.

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "Add: your feature description"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 👩‍💻 Author

**DhanaLakshmi**, B.Tech Data Science, Aditya University

- GitHub: [Lakshmi335](https://github.com/Lakshmi335)
- LinkedIn: [dhanalakshmi-kolipakula](https://www.linkedin.com/in/dhanalakshmi-kolipakula-32998231b/)

⭐ If this project helped you, please give it a star!

Built with React, Node.js, MongoDB and AI.
