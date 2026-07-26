import { useState } from "react";
import { FileText, CheckCircle2, AlertTriangle, Download, TrendingUp, Award, BarChart3, Sparkles } from "lucide-react";
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

function ScoreRing({ value, size = 120 }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="6" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="url(#scoreGrad)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease" }} />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DC08D" />
            <stop offset="100%" stopColor="#1a8a6a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>{value}</span>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, desc }) {
  const barColor = value >= 80 ? "bg-green-500" : value >= 60 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="p-5 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        <span className="text-lg font-bold text-slate-900">{value}<span className="text-xs font-normal text-slate-400 ml-0.5">/100</span></span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`} style={{ width: `${value}%` }}></div>
      </div>
      <p className="text-xs text-slate-400 mt-2">{desc}</p>
    </div>
  );
}

export default function AnalysisResults({ analysis, fileName }) {
  const [exporting, setExporting] = useState(false);

  if (!analysis) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl mb-6 shadow-sm">
        <FileText className="w-12 h-12 text-[#2DC08D]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No Analysis Yet</h2>
      <p className="text-base text-slate-500 max-w-md leading-relaxed">Upload a resume from the home page to see your AI-powered ATS analysis and score breakdown.</p>
    </div>
  );

  const atsScore = analysis.ats_score ?? 0;
  const scoreKeys = Object.keys(SCORE_LABELS).filter((k) => analysis[k] != null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const reportContent = [
        "═══════════════════════════════════════",
        "         HIRELENS - ANALYSIS REPORT",
        "═══════════════════════════════════════",
        "",
        `File: ${fileName || "Resume"}`,
        `Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        "",
        `ATS Score: ${atsScore}/100`,
        ...scoreKeys.map((k) => `${SCORE_LABELS[k].label}: ${analysis[k]}/100`),
        "",
        "─────────────────────────────────────",
        "SUMMARY",
        "─────────────────────────────────────",
        "",
        analysis.summary || "N/A",
        "",
        "─────────────────────────────────────",
        "STRENGTHS",
        "─────────────────────────────────────",
        "",
        ...(analysis.strengths || []).map((s) => `  ✓ ${s}`),
        "",
        "─────────────────────────────────────",
        "AREAS TO IMPROVE",
        "─────────────────────────────────────",
        "",
        ...(analysis.weaknesses || []).map((w) => `  △ ${w}`),
        "",
        "─────────────────────────────────────",
        "RECOMMENDATIONS",
        "─────────────────────────────────────",
        "",
        ...(analysis.improvement_tips || []).map((t, i) => `  ${i + 1}. ${t}`),
        "",
        "═══════════════════════════════════════",
        "  Generated by HireLens AI Platform",
        "═══════════════════════════════════════",
      ].join("\n");

      const res = await exportApi.report({
        content: reportContent,
        title: "HireLens-Report",
        format: "pdf",
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `HireLens-Report-${fileName ? fileName.replace(/\.[^/.]+$/, "") : "Resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
    setExporting(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-[fadeIn_0.5s_ease]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2DC08D] text-sm font-semibold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" /> Analysis Report
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Analysis</h1>
          <p className="mt-1.5 text-slate-500 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> {fileName || "Resume"}
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={exporting} className="h-11 px-6 shadow-sm border-slate-200 hover:bg-slate-50 hover:border-slate-300">
          <Download className={`w-4 h-4 mr-2 ${exporting ? "animate-pulse" : ""}`} />
          {exporting ? "Exporting..." : "Download Report"}
        </Button>
      </div>

      {/* Overall Score */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2DC08D]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <ScoreRing value={atsScore} />
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">ATS Compatibility</span>
          </div>
          <p className="text-white text-lg font-medium leading-relaxed">
            {atsScore >= 80 ? "Strong compatibility — your resume is well optimized for ATS systems." :
             atsScore >= 60 ? "Moderate compatibility — some improvements recommended." :
             "Needs improvement — significant changes recommended to pass ATS filters."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Top {atsScore >= 80 ? "10%" : atsScore >= 60 ? "50%" : "75%"} percentile</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{scoreKeys.length} dimensions analyzed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-scores */}
      {scoreKeys.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scoreKeys.map((key) => (
              <ScoreBar key={key} label={SCORE_LABELS[key].label} value={analysis[key]} desc={SCORE_LABELS[key].desc} />
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {analysis.summary && (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#2DC08D] rounded-full" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analysis.strengths?.length > 0 && (
          <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="text-lg text-slate-900">Strengths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 flex-shrink-0 shadow-sm" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {analysis.weaknesses?.length > 0 && (
          <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg text-slate-900">Areas to Improve</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Improvement Tips */}
      {analysis.improvement_tips?.length > 0 && (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#2DC08D] rounded-full" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.improvement_tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50/80 to-transparent border border-emerald-100/50 rounded-xl hover:from-emerald-50 hover:border-emerald-200 transition-all duration-200">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2DC08D] to-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">{i + 1}</span>
                <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
