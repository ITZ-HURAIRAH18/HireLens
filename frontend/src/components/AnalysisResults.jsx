import { useState, useEffect } from "react";
import "./AnalysisResults.css";

export default function AnalysisResults({ analysis, fileName, fileSize }) {
  const [visible, setVisible] = useState(false);
  const [progressBars, setProgressBars] = useState([
    { name: "Skills match", value: 74 },
    { name: "Experience depth", value: 68 },
    { name: "Format quality", value: 91 },
  ]);

  useEffect(() => {
    // Fade in after mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Derive scores from analysis data if available
  const atsScore = analysis?.ats_score ?? 74;
  const clarityScore = analysis?.clarity_score ?? 68;
  const impactScore = analysis?.impact_score ?? 82;

  // Override progress bars if analysis data provides them
  useEffect(() => {
    if (analysis) {
      const bars = [];
      if (analysis.skills_match !== undefined) {
        bars.push({ name: "Skills match", value: analysis.skills_match });
      } else {
        bars.push({ name: "Skills match", value: atsScore });
      }
      if (analysis.experience_depth !== undefined) {
        bars.push({ name: "Experience depth", value: analysis.experience_depth });
      } else {
        bars.push({ name: "Experience depth", value: clarityScore });
      }
      if (analysis.format_quality !== undefined) {
        bars.push({ name: "Format quality", value: analysis.format_quality });
      } else {
        bars.push({ name: "Format quality", value: impactScore });
      }
      setProgressBars(bars);
    }
  }, [analysis]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  if (!visible) return null;

  return (
    <section className="analysis-results fade-up">
      {/* Section Label */}
      <p className="section-label">Analysis Results</p>

      {/* Resume Card */}
      <div className="resume-card">
        {/* Top Row */}
        <div className="resume-card-top">
          <div className="resume-card-left">
            <div className="file-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="file-info">
              <span className="file-name">{fileName || "resume.pdf"}</span>
              <span className="file-meta">{formatFileSize(fileSize)} &middot; Uploaded just now</span>
            </div>
          </div>
          <span className="analyzed-badge">Analyzed</span>
        </div>

        {/* Scores Row */}
        <div className="scores-row">
          <div className="score-card">
            <span className="score-number">{atsScore}</span>
            <span className="score-label">ATS Score</span>
          </div>
          <div className="score-card">
            <span className="score-number">{clarityScore}</span>
            <span className="score-label">Clarity</span>
          </div>
          <div className="score-card">
            <span className="score-number">{impactScore}</span>
            <span className="score-label">Impact</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="progress-bars">
          {progressBars.map((bar, i) => (
            <div key={i} className="progress-item">
              <div className="progress-header">
                <span className="progress-name">{bar.name}</span>
                <span className="progress-value">{bar.value}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ "--w": bar.value + "%" }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
