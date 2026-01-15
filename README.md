 HireLens 🎯

> AI-Powered Resume Analysis and Career Advisory Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://hire-lensz.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.1+-61dafb)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🌐 Live Application

**Frontend:** [https://hire-lensz.vercel.app/](https://hire-lensz.vercel.app/)

## 📋 Overview

HireLens is a production-ready AI-powered platform that helps job seekers optimize their resumes through intelligent analysis and interactive career guidance. Built with FastAPI and React, it leverages advanced AI agents to provide personalized feedback and actionable insights.

## ✨ Features

### 🤖 AI-Powered Resume Analysis
- **Smart Parsing**: Automatically extracts structured data from PDF and DOCX resumes
- **Intelligent Review**: AI agent analyzes resume content and provides detailed feedback
- **Session Management**: Persistent analysis sessions for follow-up questions

### 💬 Interactive Chat Interface
- **Resume-Specific Chatbot**: Ask questions about your resume analysis
- **Context-Aware Responses**: AI remembers your resume details throughout the conversation
- **Career Guidance**: Get personalized advice on improving your resume

### 📄 File Format Support
- PDF documents
- Microsoft Word (.docx) files

## 🏗️ Architecture

```
HireLens/
├── backend/               # FastAPI Backend
│   ├── app/
│   │   ├── agents/       # AI agents for analysis and chat
│   │   ├── api/          # REST API endpoints
│   │   ├── core/         # Configuration and settings
│   │   ├── schemas/      # Pydantic models
│   │   ├── services/     # Resume parsing services
│   │   └── state/        # Session management
│   └── requirements.txt
└── frontend/             # React + Vite Frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── api/          # API client
    │   └── styles/       # CSS styling
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.9+
- **Frontend**: Node.js 18+
- API keys for AI services (configured in backend)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   Create a `.env` file in the backend directory with necessary API keys and configurations.

5. **Run the development server**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Update the API base URL in `src/api/index.js` if needed.

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

## 🔌 API Endpoints

### Resume Management

#### Upload Resume
```http
POST /api/v1/resume/upload
Content-Type: multipart/form-data

file: <resume.pdf|resume.docx>
```

#### Analyze Resume
```http
POST /api/v1/resume/analyze
Content-Type: application/json

{
  "resume_text": "string"
}
```

#### Upload and Analyze (Combined)
```http
POST /api/v1/resume/upload-and-analyze
Content-Type: multipart/form-data

file: <resume.pdf|resume.docx>
```

**Response:**
```json
{
  "message": "Resume uploaded & analyzed successfully",
  "session_id": "uuid",
  "parsed_resume": {...},
  "ai_analysis": {...}
}
```

### Chat Interface

#### Chat with Resume Agent
```http
POST /api/v1/chat
Content-Type: application/json

{
  "session_id": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "reply": "string",
  "chat_history": [...]
}
```

### Health Check

```http
GET /api/v1/health
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **AI/ML**: LangChain, LangGraph
- **Document Processing**: PyPDF2, python-docx
- **Validation**: Pydantic
- **Deployment**: Vercel (Serverless)

### Frontend
- **Framework**: React 19.1
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 4.1
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🌟 Key Components

### Backend Agents

- **Resume Agent** (`app/agents/resume_agent.py`): Analyzes resumes and provides structured feedback
- **Chat Agent** (`app/agents/resume_chat_agent.py`): Handles interactive conversations about resume analysis

### Frontend Components

- **ChatBot** (`src/components/ChatBot.jsx`): Main chat interface
- **ResumeChat** (`src/components/ResumeChat.jsx`): Resume-specific chat component

## 📝 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

### Linting
```bash
# Frontend
npm run lint
```

### Building for Production

#### Backend
The backend is configured for Vercel deployment with `vercel.json`.

#### Frontend
```bash
cd frontend
npm run build
```

## 🔒 Security

- CORS configured with regex pattern for Vercel deployments
- Temporary file handling with automatic cleanup
- Session-based state management
- Input validation with Pydantic

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Authors

Built with ❤️ by the M Abu Hurairah

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- React team for the powerful UI library
- LangChain for AI agent capabilities
- Vercel for seamless deployment

---

**Live Demo:** [https://hire-lensz.vercel.app/](https://hire-lensz.vercel.app/)

For questions or support, please open an issue on GitHub." 
