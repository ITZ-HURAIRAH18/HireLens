import { useState } from "react";
import { TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { invokeAgent } from "../api";

export default function Compare() {
  const [resumeText, setResumeText] = useState("");
  const [improvedText, setImprovedText] = useState("");
  const [originalResult, setOriginalResult] = useState(null);
  const [improvedResult, setImprovedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!resumeText.trim() || !improvedText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [origRes, imprRes] = await Promise.all([
        invokeAgent({ session_id: "compare-session", intent: "ats", resume_text: resumeText }),
        invokeAgent({ session_id: "compare-session", intent: "ats", resume_text: improvedText }),
      ]);
      setOriginalResult(origRes.data.output || { ats_compatibility_score: 0 });
      setImprovedResult(imprRes.data.output || { ats_compatibility_score: 0 });
    } catch (err) {
      setError("Comparison failed. Please try again.");
    }
    setLoading(false);
  };

  const origScore = originalResult?.ats_compatibility_score ?? null;
  const imprScore = improvedResult?.ats_compatibility_score ?? null;
  const diff = origScore !== null && imprScore !== null ? imprScore - origScore : null;

  return (
    <div className="space-y-6 fade-up pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Compare Resumes</h1>
        <p className="mt-2 text-slate-500 text-sm">Paste two versions of your resume to compare their ATS scores side by side.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardContent className="p-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">Original Resume</p>
          <textarea rows={10} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste original resume text..." className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97757]" />
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">Improved Resume</p>
          <textarea rows={10} value={improvedText} onChange={(e) => setImprovedText(e.target.value)} placeholder="Paste improved resume text..." className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d97757]" />
        </CardContent></Card>
      </div>
      <div className="flex justify-center">
        <Button onClick={handleCompare} disabled={loading || !resumeText.trim() || !improvedText.trim()}>{loading ? "Comparing..." : "Compare"}</Button>
      </div>
      {error && <div className="text-center text-red-600 text-sm">{error}</div>}
      {(originalResult || improvedResult) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Original</CardTitle></CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold text-slate-900">{origScore ?? "—"}</p>
              <p className="text-sm text-slate-500 mt-1">ATS Score</p>
              {originalResult?.summary && <p className="text-xs text-slate-600 mt-3">{originalResult.summary}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Improved</CardTitle></CardHeader>
            <CardContent className="text-center">
              <p className="text-4xl font-bold text-slate-900">{imprScore ?? "—"}</p>
              <p className="text-sm text-slate-500 mt-1">ATS Score</p>
              {improvedResult?.summary && <p className="text-xs text-slate-600 mt-3">{improvedResult.summary}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Difference</CardTitle></CardHeader>
            <CardContent className="text-center">
              {diff !== null ? (
                <>
                  <div className="flex items-center justify-center gap-1">
                    {diff > 0 ? <ArrowUp className="w-6 h-6 text-green-500" /> : diff < 0 ? <ArrowDown className="w-6 h-6 text-red-500" /> : <Minus className="w-6 h-6 text-slate-400" />}
                    <p className={`text-4xl font-bold ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-slate-900"}`}>{diff > 0 ? "+" : ""}{diff}</p>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{diff > 0 ? "Improved" : diff < 0 ? "Declined" : "No change"}</p>
                </>
              ) : (
                <p className="text-slate-400">—</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
