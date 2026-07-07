import { FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { exportApi } from "../api";

export default function AnalysisResults({ analysis, fileName }) {
  if (!analysis) return <div className="text-center py-20 text-slate-400">No analysis data available. Upload a resume first.</div>;

  const atsScore = analysis.ats_score ?? 0;
  const clarityScore = analysis.clarity_score ?? 0;
  const impactScore = analysis.impact_score ?? 0;

  const handleExport = async () => {
    try {
      const reportContent = `ATS Score: ${atsScore}/100\nClarity: ${clarityScore}/100\nImpact: ${impactScore}/100\n\nSummary: ${analysis.summary || "N/A"}\n\nStrengths: ${(analysis.strengths || []).join(", ")}\nWeaknesses: ${(analysis.weaknesses || []).join(", ")}`;
      await exportApi.report({ content: reportContent, title: "HireLens-Report", format: "pdf" });
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
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExport}>Download Report</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-slate-900 text-white border-none">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
            <h3 className="text-lg font-medium text-slate-300">Overall ATS Score</h3>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * atsScore) / 100} className={atsScore > 75 ? "text-green-500" : "text-amber-500"} />
              </svg>
              <span className="absolute text-4xl font-bold">{atsScore}</span>
            </div>
            <p className="text-sm text-slate-400">{atsScore > 75 ? "Great job! Highly ATS compatible." : "Needs improvement to pass ATS filters."}</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Score Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2"><span className="text-sm font-medium text-slate-700">Impact</span><span className="text-sm font-medium text-slate-900">{impactScore}/100</span></div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-[#d97757] h-2 rounded-full" style={{ width: `${impactScore}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-2"><span className="text-sm font-medium text-slate-700">Clarity</span><span className="text-sm font-medium text-slate-900">{clarityScore}/100</span></div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-[#d97757] h-2 rounded-full" style={{ width: `${clarityScore}%` }}></div></div>
            </div>
            {analysis.summary && <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg text-sm text-slate-800"><strong className="text-[#d97757] font-semibold">Summary:</strong> {analysis.summary}</div>}
          </CardContent>
        </Card>
      </div>
      {analysis.strengths?.length > 0 && (
        <Card><CardHeader><CardTitle>Strengths</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{analysis.strengths.map((s, i) => <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200"><CheckCircle2 className="w-3 h-3 inline mr-1" />{s}</span>)}</div></CardContent></Card>
      )}
      {analysis.weaknesses?.length > 0 && (
        <Card><CardHeader><CardTitle>Areas to Improve</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{analysis.weaknesses.map((w, i) => <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200"><AlertTriangle className="w-3 h-3 inline mr-1" />{w}</span>)}</div></CardContent></Card>
      )}
    </div>
  );
}
