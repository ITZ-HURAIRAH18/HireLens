import { useState, useEffect } from "react";
import { TrendingUp, Sparkles, FileText, CheckCircle2, ArrowRight, Loader2, Zap, ChevronDown } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { invokeAgent, getResumes } from "../api";

export default function Compare() {
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [enhanced, setEnhanced] = useState(null);
  const [enhancing, setEnhancing] = useState(false);
  const [originalScore, setOriginalScore] = useState(null);
  const [enhancedScore, setEnhancedScore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getResumes()
      .then((res) => {
        const list = res.data || [];
        setResumes(list);
        if (list.length > 0) setSelectedIdx(list.length - 1);
      })
      .catch(() => setResumes([]))
      .finally(() => setLoadingResumes(false));
  }, []);

  const currentResume = resumes[selectedIdx];

  const handleEnhance = async () => {
    if (!currentResume?.resume_text?.trim()) return;
    setEnhancing(true);
    setError(null);
    setEnhanced(null);
    setOriginalScore(null);
    setEnhancedScore(null);
    try {
      const [enhanceRes, origAtsRes] = await Promise.all([
        invokeAgent({
          session_id: "compare-session",
          intent: "enhance",
          resume_text: currentResume.resume_text,
        }),
        invokeAgent({
          session_id: "compare-session",
          intent: "ats",
          resume_text: currentResume.resume_text,
        }),
      ]);

      if (enhanceRes.data.error) {
        setError(enhanceRes.data.error);
        setEnhancing(false);
        return;
      }

      setEnhanced(enhanceRes.data.output || {});
      setOriginalScore(origAtsRes.data.output?.ats_compatibility_score ?? null);

      if (enhanceRes.data.output?.enhanced_text) {
        const imprAtsRes = await invokeAgent({
          session_id: "compare-session",
          intent: "ats",
          resume_text: enhanceRes.data.output.enhanced_text,
        });
        setEnhancedScore(imprAtsRes.data.output?.ats_compatibility_score ?? null);
      }
    } catch (err) {
      setError("Enhancement failed. Please try again.");
    }
    setEnhancing(false);
  };

  if (loadingResumes) {
    return (
      <div className="space-y-6 fade-up pb-12">
        <Skeleton height={32} width={250} />
        <Skeleton height={16} width={400} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={400} />
          <Skeleton height={400} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-up pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Resume Enhancer</h1>
        <p className="mt-2 text-slate-500 text-sm">Select a resume and let AI rewrite it for stronger ATS performance and professional impact.</p>
      </div>

      {!currentResume ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-5 bg-slate-50 rounded-full mb-5">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-1">No Resumes Found</h3>
            <p className="text-base text-slate-400 max-w-sm">Upload a resume first to use the AI enhancer.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-xs">
              <select value={selectedIdx} onChange={(e) => { setSelectedIdx(Number(e.target.value)); setEnhanced(null); setOriginalScore(null); setEnhancedScore(null); }} className="w-full appearance-none border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#d97757] pr-8">
                {resumes.map((r, i) => (
                  <option key={r.id} value={i}>{r.filename} — {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <Button onClick={handleEnhance} disabled={enhancing} className="gap-2 shadow-md" size="lg">
              {enhancing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {enhancing ? "Enhancing..." : "AI Enhance Resume"}
            </Button>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Original Resume</CardTitle>
                  {originalScore !== null && (
                    <span className="text-sm font-bold text-slate-900">{originalScore}<span className="text-xs font-normal text-slate-400">/100</span></span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{currentResume.filename}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 rounded-lg p-4 border border-slate-200">
                  {currentResume.resume_text}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {enhanced ? <Sparkles className="w-4 h-4 text-[#d97757]" /> : <Zap className="w-4 h-4 text-slate-300" />}
                    AI-Enhanced
                  </CardTitle>
                  {enhancedScore !== null && (
                    <span className="text-sm font-bold text-green-600">{enhancedScore}<span className="text-xs font-normal text-slate-400">/100</span></span>
                  )}
                </div>
                {!enhanced && <p className="text-xs text-slate-400">Click "AI Enhance Resume" to generate</p>}
              </CardHeader>
              <CardContent className="pt-0">
                {enhancing ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#d97757]" />
                    <p className="text-sm">AI is enhancing your resume...</p>
                  </div>
                ) : enhanced ? (
                  <div className="max-h-[500px] overflow-y-auto whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-mono bg-orange-50 rounded-lg p-4 border border-orange-200">
                    {enhanced.enhanced_text}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <Sparkles className="w-12 h-12 mb-3" />
                    <p className="text-sm">Enhanced resume will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {enhanced?.changes_summary && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-base">Improvements Made</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{enhanced.changes_summary}</div>
              </CardContent>
            </Card>
          )}

          {enhanced?.keywords_added?.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#d97757]" />
                  <CardTitle className="text-base">Keywords Added</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {enhanced.keywords_added.map((kw, i) => (
                    <span key={i} className="px-3 py-1.5 bg-orange-50 text-[#d97757] text-sm font-medium rounded-full border border-orange-200">{kw}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {originalScore !== null && enhancedScore !== null && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Original ATS Score</CardTitle></CardHeader>
                <CardContent className="pt-0 text-center">
                  <p className="text-4xl font-bold text-slate-900">{originalScore}</p>
                  <p className="text-sm text-slate-400 mt-1">/100</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Enhanced ATS Score</CardTitle></CardHeader>
                <CardContent className="pt-0 text-center">
                  <p className="text-4xl font-bold text-green-600">{enhancedScore}</p>
                  <p className="text-sm text-slate-400 mt-1">/100</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Improvement</CardTitle></CardHeader>
                <CardContent className="pt-0 text-center">
                  <p className="text-4xl font-bold text-green-600">+{enhancedScore - originalScore}</p>
                  <p className="text-sm text-slate-400 mt-1">points gained</p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
