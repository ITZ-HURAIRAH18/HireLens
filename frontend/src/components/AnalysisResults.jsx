import { FileText, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { exportApi } from "../api";

const SCORE_LABELS = {
  keyword_score: { label: "Keywords", desc: "Industry keyword coverage" },
  content_score: { label: "Content", desc: "Quantified achievements & action verbs" },
  format_score: { label: "Format", desc: "Section headings & structure" },
  completeness_score: { label: "Completeness", desc: "Contact, experience, education" },
  readability_score: { label: "Readability", desc: "Clarity & conciseness" },
};

export default function AnalysisResults({ analysis, fileName }) {
  if (!analysis) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-5 bg-emerald-50 rounded-full mb-6">
        <FileText className="w-10 h-10 text-[#2DC08D]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">No Analysis Yet</h2>
      <p className="text-base text-slate-500 max-w-md">Upload a resume from the home page to see your AI-powered ATS analysis and score breakdown.</p>
    </div>
  );

  const atsScore = analysis.ats_score ?? 0;
  const scoreKeys = Object.keys(SCORE_LABELS).filter((k) => analysis[k] != null);

  const handleExport = async () => {
    try {
      const reportContent = [
        `ATS Score: ${atsScore}/100`,
        ...scoreKeys.map((k) => `${SCORE_LABELS[k].label}: ${analysis[k]}/100`),
        "",
        `Summary: ${analysis.summary || "N/A"}`,
        "",
        "Strengths:",
        ...(analysis.strengths || []).map((s) => `  - ${s}`),
        "",
        "Areas to Improve:",
        ...(analysis.weaknesses || []).map((w) => `  - ${w}`),
      ].join("\n");

      const res = await exportApi.report({
        content: reportContent,
        title: "HireLens-Report",
        format: "pdf",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "HireLens-Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="space-y-8 fade-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Analysis</h1>
          <p className="mt-2 text-slate-500 text-sm flex items-center"><FileText className="w-4 h-4 mr-2" />{fileName || "Resume"}</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Download Report
        </Button>
      </div>

      {/* Overall Score */}
      <div className="flex items-center gap-6 p-6 bg-white border border-slate-200 rounded-xl">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#2DC08D" strokeWidth="3"
              strokeDasharray={`${atsScore}, 100`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-900">{atsScore}</span>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-900">ATS Compatibility Score</p>
          <p className="text-sm text-slate-500 mt-1">
            {atsScore >= 80 ? "Strong compatibility — well optimized for ATS systems." :
             atsScore >= 60 ? "Moderate compatibility — some improvements recommended." :
             "Needs improvement — significant changes recommended to pass ATS filters."}
          </p>
        </div>
      </div>

      {/* Sub-scores */}
      {scoreKeys.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoreKeys.map((key) => {
            const val = analysis[key];
            const meta = SCORE_LABELS[key];
            return (
              <div key={key} className="p-5 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">{meta.label}</span>
                  <span className="text-sm font-bold text-slate-900">{val}<span className="text-xs font-normal text-slate-400">/100</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#2DC08D] h-2 rounded-full transition-all" style={{ width: `${val}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{meta.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {analysis.summary && (
        <Card>
          <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analysis.strengths?.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <CardTitle>Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {analysis.weaknesses?.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-emerald-500" />
                <CardTitle>Areas to Improve</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Improvement Tips */}
      {analysis.improvement_tips?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.improvement_tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-[#2DC08D] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}