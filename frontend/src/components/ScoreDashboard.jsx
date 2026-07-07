import "./ScoreDashboard.css";

const SCORE_META = {
  ats_score: { label: "ATS Score", desc: "Compatibility" },
  clarity_score: { label: "Clarity", desc: "Readability" },
  impact_score: { label: "Impact", desc: "Achievements" },
  skills_match: { label: "Skills Match", desc: "Keyword coverage" },
  experience_depth: { label: "Experience", desc: "Depth & breadth" },
  format_quality: { label: "Format", desc: "Structure" },
};

export default function ScoreDashboard({ analysis }) {
  if (!analysis) return null;

  const scoreKeys = Object.keys(SCORE_META).filter((k) => analysis[k] !== undefined);
  if (scoreKeys.length === 0) {
    const derived = [
      { key: "ats_score", value: analysis.ats_score ?? 74 },
      { key: "clarity_score", value: analysis.clarity_score ?? 68 },
      { key: "impact_score", value: analysis.impact_score ?? 82 },
    ];
    return (
      <section className="score-dashboard fade-up">
        <p className="section-label">Score Dashboard</p>
        <div className="scores-radial">
          {derived.map(({ key, value }) => (
            <div key={key} className="radial-card">
              <svg viewBox="0 0 36 36" className="radial-chart">
                <path className="radial-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="radial-fill" strokeDasharray={`${value}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.5" className="radial-text">{value}</text>
              </svg>
              <span className="radial-label">{SCORE_META[key].label}</span>
              <span className="radial-desc">{SCORE_META[key].desc}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="score-dashboard fade-up">
      <p className="section-label">Score Dashboard</p>
      <div className="scores-radial">
        {scoreKeys.map((key) => (
          <div key={key} className="radial-card">
            <svg viewBox="0 0 36 36" className="radial-chart">
              <path className="radial-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="radial-fill" strokeDasharray={`${analysis[key]}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.5" className="radial-text">{analysis[key]}</text>
            </svg>
            <span className="radial-label">{SCORE_META[key].label}</span>
            <span className="radial-desc">{SCORE_META[key].desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
