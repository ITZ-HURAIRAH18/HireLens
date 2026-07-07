# HireLens — AI-Powered Career Platform

Multi-agent AI career advisor platform built with FastAPI, LangGraph, React, and Gemini AI.

## Architecture

### Backend (FastAPI + LangGraph)
- **Supervisor Graph** — Central LangGraph with 8 specialized agents
- **Agents**: Resume Analysis, Resume Chat, Job Matching, ATS Optimization, Cover Letter, Interview Prep, Mock Interview, Career Path
- **Auth**: JWT-based (signup/login/logout)
- **Database**: PostgreSQL + SQLAlchemy + Alembic
- **Export**: PDF generation via ReportLab
- **Streaming**: SSE for token-by-token chat
- **Subscriptions**: Stripe integration for free/premium tiers

### Frontend (React + Vite)
- Resume upload & analysis
- Score dashboard with radial charts
- Job description matcher with keyword chips
- Multi-agent chat with agent labels
- PDF export for resumes, cover letters, reports

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your keys
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/agent/invoke | Invoke any agent through supervisor |
| POST | /api/v1/auth/signup | Create account |
| POST | /api/v1/auth/login | Login |
| GET | /api/v1/auth/me | Current user |
| POST | /api/v1/resume/upload | Parse resume file |
| POST | /api/v1/resume/analyze | Analyze resume text |
| POST | /api/v1/resume/upload-and-analyze | Upload + analyze |
| POST | /api/v1/resume/chat/ | Chat with resume |
| POST | /api/v1/export/resume | Export resume as PDF |
| POST | /api/v1/export/cover-letter | Export cover letter as PDF |
| POST | /api/v1/export/report | Export report as PDF |
| POST | /api/v1/stream/chat | Streaming chat (SSE) |
| POST | /api/v1/subscriptions/create-checkout | Stripe checkout |
| POST | /api/v1/subscriptions/webhook | Stripe webhook |
| GET | /api/v1/subscriptions/status | Subscription status |

## Environment Variables

Create `.env` in `backend/`:
```
GOOGLE_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/hirelens
SECRET_KEY=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

## Testing
```bash
cd backend
pytest tests/ -v
```
