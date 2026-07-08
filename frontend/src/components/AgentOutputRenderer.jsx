import { CheckCircle2, AlertTriangle, Target, BookOpen, Award, TrendingUp, Lightbulb, Star, Zap, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

function ScoreRing({ score, label, size = "md" }) {
  const isLarge = size === "lg";
  const dimension = isLarge ? "w-24 h-24" : "w-16 h-16";
  const innerSize = isLarge ? "text-2xl" : "text-base";
  const strokeWidth = isLarge ? "3" : "2.5";
  const radius = isLarge ? "15.5" : "10";
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className={`relative ${dimension} flex-shrink-0`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#d97757" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-bold text-slate-900 ${innerSize}`}>{score}</span>
      {label && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 whitespace-nowrap">{label}</span>}
    </div>
  );
}

function SubScoreBar({ label, value, desc }) {
  return (
    <div className="p-3 bg-white border border-slate-200 rounded-lg">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-900">{value}<span className="text-[10px] font-normal text-slate-400">/100</span></span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div className="bg-[#d97757] h-1.5 rounded-full transition-all" style={{ width: `${value}%` }}></div>
      </div>
      {desc && <p className="text-[10px] text-slate-400 mt-1">{desc}</p>}
    </div>
  );
}

function ResumeAnalysisView({ output }) {
  const score = output.ats_score ?? 0;
  const subScores = [
    { key: "keyword_score", label: "Keywords", desc: "Industry keyword coverage" },
    { key: "content_score", label: "Content", desc: "Achievements & action verbs" },
    { key: "format_score", label: "Format", desc: "Section headings & structure" },
    { key: "completeness_score", label: "Completeness", desc: "Contact, experience, education" },
    { key: "readability_score", label: "Readability", desc: "Clarity & conciseness" },
  ].filter(s => output[s.key] != null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <ScoreRing score={score} label="ATS Score" size="lg" />
        <div>
          <p className="text-sm font-semibold text-slate-900">ATS Compatibility Score</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {score >= 80 ? "Strong compatibility" : score >= 60 ? "Moderate compatibility" : "Needs improvement"}
          </p>
          {output.summary && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{output.summary}</p>}
        </div>
      </div>
      {subScores.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subScores.map(s => <SubScoreBar key={s.key} label={s.label} value={output[s.key]} desc={s.desc} />)}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {output.strengths?.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /><CardTitle className="text-sm">Strengths</CardTitle></div></CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5">
                {output.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {output.weaknesses?.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /><CardTitle className="text-sm">Areas to Improve</CardTitle></div></CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1.5">
                {output.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />{w}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
      {output.improvement_tips?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-[#d97757]" /><CardTitle className="text-sm">Recommendations</CardTitle></div></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {output.improvement_tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-[#d97757] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-slate-700">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {output.suggested_roles?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {output.suggested_roles.map((role, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-[#d97757] text-[11px] font-medium rounded-full border border-orange-200">
              <Star className="w-3 h-3" />{role}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ATSView({ output }) {
  const score = output.ats_compatibility_score ?? 0;
  const subScores = [
    { key: "keyword_score", label: "Keywords" },
    { key: "content_score", label: "Content" },
    { key: "format_score", label: "Format" },
    { key: "completeness_score", label: "Completeness" },
    { key: "readability_score", label: "Readability" },
  ].filter(s => output[s.key] != null);

  const issues = [...(output.critical_issues || []), ...(output.warnings || []), ...(output.suggestions || [])];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <ScoreRing score={score} label="ATS Score" size="lg" />
        <div>
          <p className="text-sm font-semibold text-slate-900">ATS Compatibility</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {score >= 80 ? "Well optimized for ATS systems" : score >= 60 ? "Some improvements recommended" : "Significant changes needed"}
          </p>
          {output.summary && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{output.summary}</p>}
        </div>
      </div>
      {subScores.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {subScores.map(s => <SubScoreBar key={s.key} label={s.label} value={output[s.key]} />)}
        </div>
      )}
      {issues.length > 0 && (
        <div className="space-y-2">
          {issues.map((item, i) => (
            <div key={i} className={`p-3 rounded-lg border text-xs ${item.severity === "critical" ? "bg-red-50 border-red-200" : item.severity === "warning" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-start gap-2">
                {item.severity === "critical" ? <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" /> : <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="font-medium text-slate-800">{item.issue}</p>
                  {item.recommendation && <p className="text-slate-500 mt-0.5">{item.recommendation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobMatchView({ output }) {
  const pct = output.match_percentage ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#d97757" strokeWidth="3"
              strokeDasharray={`${pct * 0.628}, 62.8`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900">{pct}%</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Job Match</p>
          <p className="text-xs text-slate-500 mt-0.5">{pct >= 80 ? "Strong match" : pct >= 60 ? "Moderate match" : "Weak match"}</p>
          {output.overall_assessment && <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{output.overall_assessment}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {output.matched_keywords?.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-600" /><CardTitle className="text-sm">Matched Keywords</CardTitle></div></CardHeader>
            <CardContent className="pt-0 flex flex-wrap gap-1.5">
              {output.matched_keywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-[11px] font-medium rounded-full border border-green-200">{kw}</span>
              ))}
            </CardContent>
          </Card>
        )}
        {output.missing_keywords?.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /><CardTitle className="text-sm">Missing Keywords</CardTitle></div></CardHeader>
            <CardContent className="pt-0 flex flex-wrap gap-1.5">
              {output.missing_keywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-medium rounded-full border border-amber-200">{kw}</span>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      {output.skill_gaps?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><Target className="w-4 h-4 text-[#d97757]" /><CardTitle className="text-sm">Skill Gaps</CardTitle></div></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {output.skill_gaps.map((sg, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-slate-800">{sg.skill}</p>
                  <p className="text-[10px] text-slate-400">{sg.category}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sg.importance === "high" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{sg.importance}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CoverLetterView({ output }) {
  return (
    <div className="space-y-3">
      <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap text-xs">
        {output.primary_letter}
      </div>
      {output.tone_variants?.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-[#d97757] font-medium hover:underline">Other tone variants ({output.tone_variants.length})</summary>
          <div className="mt-2 space-y-3">
            {output.tone_variants.map((v, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-slate-700 mb-1 capitalize">{v.tone}</p>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{v.content}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function InterviewPrepView({ output }) {
  return (
    <div className="space-y-4">
      {output.target_role && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <Target className="w-4 h-4 text-[#d97757]" />
          <span className="text-xs font-medium text-slate-800">Target: {output.target_role}</span>
        </div>
      )}
      {output.questions?.length > 0 && (
        <div className="space-y-3">
          {output.questions.map((q, i) => (
            <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#d97757] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${q.category === "behavioral" ? "bg-blue-50 text-blue-600" : q.category === "technical" ? "bg-purple-50 text-purple-600" : "bg-green-50 text-green-600"}`}>{q.category}</span>
                  <p className="text-xs text-slate-800 mt-1">{q.question}</p>
                  {q.tips && <p className="text-[10px] text-slate-500 mt-1 italic">Tip: {q.tips}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {output.preparation_tips && (
        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 leading-relaxed">{output.preparation_tips}</p>
        </div>
      )}
    </div>
  );
}

function MockInterviewView({ output }) {
  const scores = [
    { key: "clarity_score", label: "Clarity" },
    { key: "structure_score", label: "Structure" },
    { key: "star_method_score", label: "STAR Method" },
    { key: "relevance_score", label: "Relevance" },
  ].filter(s => output[s.key] != null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {scores.map(s => (
          <div key={s.key} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
            <ScoreRing score={output[s.key]} />
            <span className="text-xs font-medium text-slate-700">{s.label}</span>
          </div>
        ))}
      </div>
      {output.feedback && (
        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <TrendingUp className="w-4 h-4 text-[#d97757] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 leading-relaxed">{output.feedback}</p>
        </div>
      )}
      {output.improved_answer && (
        <Card>
          <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-green-600" /><CardTitle className="text-sm">Improved Answer</CardTitle></div></CardHeader>
          <CardContent className="pt-0">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{output.improved_answer}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CareerPathView({ output }) {
  return (
    <div className="space-y-4">
      {output.target_role && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <Award className="w-4 h-4 text-[#d97757]" />
          <span className="text-xs font-medium text-slate-800">Target: {output.target_role}</span>
        </div>
      )}
      {output.skill_gaps?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><Target className="w-4 h-4 text-[#d97757]" /><CardTitle className="text-sm">Skill Gaps</CardTitle></div></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {output.skill_gaps.map((sg, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{sg.skill}</p>
                  <p className="text-[10px] text-slate-400">{sg.current_level} &rarr; {sg.required_level}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${sg.priority === "high" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{sg.priority}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {output.certifications?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-blue-600" /><CardTitle className="text-sm">Certifications</CardTitle></div></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {output.certifications.map((cert, i) => (
              <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <p className="text-xs font-medium text-slate-800">{cert.name}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                  <span>{cert.provider}</span>
                  <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" />{cert.estimated_time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {output.learning_roadmap?.length > 0 && (
        <div className="space-y-3">
          {output.learning_roadmap.map((phase, i) => (
            <div key={i} className="relative pl-5 border-l-2 border-[#d97757]">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#d97757] flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">{i + 1}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg ml-2">
                <p className="text-xs font-semibold text-slate-800">{phase.phase}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{phase.duration} &middot; {phase.focus}</p>
                {phase.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {phase.skills.map((skill, j) => (
                      <span key={j} className="px-1.5 py-0.5 bg-slate-50 text-slate-600 text-[10px] rounded border border-slate-200">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {output.estimated_timeline && (
        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <TrendingUp className="w-4 h-4 text-[#d97757] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-700 leading-relaxed">{output.estimated_timeline}</p>
        </div>
      )}
    </div>
  );
}

function AgentOutputRenderer({ agent, output }) {
  if (!output || Object.keys(output).length === 0) return null;

  switch (agent) {
    case "analyze":
      return <ResumeAnalysisView output={output} />;
    case "ats":
      return <ATSView output={output} />;
    case "job_match":
      return <JobMatchView output={output} />;
    case "cover_letter":
      return <CoverLetterView output={output} />;
    case "interview_prep":
      return <InterviewPrepView output={output} />;
    case "mock_interview":
      return <MockInterviewView output={output} />;
    case "career_path":
      return <CareerPathView output={output} />;
    default:
      return <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{output.reply || JSON.stringify(output, null, 2)}</div>;
  }
}

export { AgentOutputRenderer };
