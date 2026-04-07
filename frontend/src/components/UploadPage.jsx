import { useState, useRef, useCallback } from "react";
import "./UploadPage.css";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function UploadPage({ onFileAnalyzed, onLinkedinAnalyzed }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinError, setLinkedinError] = useState("");
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (!ACCEPTED_TYPES.includes(file.type)) return "Only PDF and DOCX files are accepted.";
    if (file.size > MAX_SIZE) return "File must be under 2MB.";
    return "";
  };

  const processFile = async (file) => {
    const error = validateFile(file);
    if (error) {
      console.error(error);
      return;
    }
    setSelectedFile(file);
    if (onFileAnalyzed) {
      onFileAnalyzed(file);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const validateLinkedinUrl = (url) => {
    if (!url.trim()) return "Please enter a LinkedIn URL.";
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\//i;
    if (!linkedinRegex.test(url.trim())) return "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username).";
    return "";
  };

  const handleLinkedinAnalyze = () => {
    const error = validateLinkedinUrl(linkedinUrl);
    setLinkedinError(error);
    if (!error && onLinkedinAnalyzed) {
      onLinkedinAnalyzed(linkedinUrl.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLinkedinAnalyze();
    }
  };

  return (
    <main className="upload-page">
      {/* Eyebrow Tag */}
      <div className="eyebrow fade-up" style={{ animationDelay: "0s" }}>
        <span className="eyebrow-dot"></span>
        AI-powered resume analysis
      </div>

      {/* Hero Title */}
      <h1 className="hero-title fade-up" style={{ animationDelay: "0.08s" }}>
        Your resume,
        <br />
        <em>decoded.</em>
      </h1>

      {/* Hero Subtitle */}
      <p className="hero-subtitle fade-up" style={{ animationDelay: "0.16s" }}>
        Upload your resume and get instant AI feedback, ATS scoring, and a personal career coach.
      </p>

      {/* Dropzone */}
      <div
        className={`dropzone fade-up ${isDragging ? "dropzone--dragover" : ""}`}
        style={{ animationDelay: "0.24s" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleDropzoneClick}
        role="button"
        tabIndex={0}
        aria-label="Upload resume file"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleDropzoneClick(); }}
      >
        <div className="dropzone-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <p className="dropzone-text-main">Drop your resume here</p>
        <p className="dropzone-text-sub">or click to browse files</p>

        <button
          className="dropzone-choose-btn"
          onClick={(e) => { e.stopPropagation(); handleDropzoneClick(); }}
        >
          Choose file
        </button>

        <p className="dropzone-hint">PDF &middot; DOCX &middot; Max 2MB</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          hidden
          onChange={handleFileSelect}
        />
      </div>

      {/* OR Divider */}
      <div className="or-divider">
        <span className="or-line"></span>
        <span className="or-text">OR</span>
        <span className="or-line"></span>
      </div>

      {/* LinkedIn URL Row */}
      <div className="linkedin-row">
        <input
          type="url"
          className="linkedin-input"
          placeholder="Paste LinkedIn URL&hellip;"
          value={linkedinUrl}
          onChange={(e) => { setLinkedinUrl(e.target.value); setLinkedinError(""); }}
          onKeyDown={handleKeyDown}
        />
        <button className="linkedin-btn" onClick={handleLinkedinAnalyze}>
          Analyze
        </button>
      </div>
      {linkedinError && <p className="linkedin-error">{linkedinError}</p>}

      {/* Feature Pills */}
      <div className="features-grid fade-up" style={{ animationDelay: "0.4s" }}>
        {/* Feature 1: ATS Score */}
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="feature-text">
            <span className="feature-title">ATS Score</span>
            <span className="feature-subtitle">Pass filters</span>
          </div>
        </div>

        {/* Feature 2: Gap Analysis */}
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="feature-text">
            <span className="feature-title">Gap Analysis</span>
            <span className="feature-subtitle">Missing keywords</span>
          </div>
        </div>

        {/* Feature 3: AI Coach */}
        <div className="feature-card">
          <div className="feature-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="feature-text">
            <span className="feature-title">AI Coach</span>
            <span className="feature-subtitle">Ask anything</span>
          </div>
        </div>
      </div>
    </main>
  );
}
