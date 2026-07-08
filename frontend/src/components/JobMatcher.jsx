import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { invokeAgent } from "../api";
import "./JobMatcher.css";

export default function JobMatcher({ sessionId, resumeText }) {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!jd.trim() || loading) return;
    setLoading(true);
    try {
      const { data } = await invokeAgent({
        session_id: sessionId || "match-session",
        intent: "job_match",
        resume_text: resumeText,
        job_description: jd,
      });
      setResult(data.output);
    } catch {
      setResult({
        match_percentage: 0,
        matched_keywords: [],
        missing_keywords: [],
        skill_gaps: [],
        overall_assessment: "Could not complete matching. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <section className="job-matcher fade-up">
      <p className="section-label">Job Description Matcher</p>
      <div className="jm-card">
        <textarea
          className="jm-input"
          placeholder="Paste a job description to check match percentage..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={4}
        />
        <button className="jm-btn" onClick={handleMatch} disabled={loading || !jd.trim()}>
          {loading ? <Skeleton width={80} /> : "Check Match"}
        </button>
      </div>

      {result && (
        <div className="jm-result">
          <div className="jm-score-card">
            <span className="jm-score-number">{result.match_percentage}%</span>
            <span className="jm-score-label">Match</span>
          </div>

          {result.matched_keywords?.length > 0 && (
            <div className="jm-section">
              <p className="jm-section-title">Matched Keywords</p>
              <div className="jm-chips">
                {result.matched_keywords.map((kw) => (
                  <span key={kw} className="jm-chip jm-chip--matched">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {result.missing_keywords?.length > 0 && (
            <div className="jm-section">
              <p className="jm-section-title">Missing Keywords</p>
              <div className="jm-chips">
                {result.missing_keywords.map((kw) => (
                  <span key={kw} className="jm-chip jm-chip--missing">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {result.skill_gaps?.length > 0 && (
            <div className="jm-section">
              <p className="jm-section-title">Skill Gaps</p>
              {result.skill_gaps.map((gap, i) => (
                <div key={i} className="jm-gap-row">
                  <span className="jm-gap-skill">{gap.skill}</span>
                  <span className={`jm-gap-importance jm-gap-importance--${gap.importance}`}>{gap.importance}</span>
                  <span className="jm-gap-category">{gap.category}</span>
                </div>
              ))}
            </div>
          )}

          <p className="jm-assessment">{result.overall_assessment}</p>
        </div>
      )}
    </section>
  );
}
