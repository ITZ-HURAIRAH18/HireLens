import { useState, useEffect } from "react";
import { FileText, CheckCircle2, TrendingUp, BarChart3, Users, Sparkles, ArrowUpRight, Clock } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { getDashboard } from "../api";

const statCards = [
  { key: "avg_score", icon: TrendingUp, label: "Average ATS Score", color: "from-emerald-500 to-green-600", bg: "bg-emerald-50" },
  { key: "total_analyses", icon: BarChart3, label: "Total Analyses", color: "from-[#2DC08D] to-emerald-600", bg: "bg-emerald-50" },
  { key: "total_resumes", icon: FileText, label: "Resumes Uploaded", color: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      <div>
        <Skeleton height={36} width={200} />
        <Skeleton height={16} width={300} className="mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton circle width={56} height={56} />
                <div className="flex-1 space-y-2">
                  <Skeleton height={14} width={100} />
                  <Skeleton height={32} width={80} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><Skeleton height={20} width={150} /></CardHeader>
        <CardContent>
          <Skeleton height={14} count={5} />
        </CardContent>
      </Card>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-5 bg-red-50 rounded-full mb-6">
        <BarChart3 className="w-10 h-10 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Failed to Load</h2>
      <p className="text-base text-slate-500">{error}</p>
    </div>
  );

  if (!stats) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl mb-6 shadow-sm">
        <FileText className="w-12 h-12 text-[#2DC08D]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No Data Yet</h2>
      <p className="text-base text-slate-500 max-w-md leading-relaxed">Upload your first resume to see your dashboard with ATS scores, analysis history, and more.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#2DC08D] text-sm font-semibold uppercase tracking-widest mb-1">
          <Sparkles className="w-4 h-4" /> Overview
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="mt-1.5 text-slate-500 text-sm">Track your resume analysis activity and performance.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map(({ key, icon: Icon, label, color, bg }) => {
          const value = key === "avg_score" ? stats.avg_score : key === "total_analyses" ? stats.total_analyses : stats.total_resumes;
          const displayValue = key === "avg_score" ? (value != null ? value : "—") : (value ?? 0);
          const isScore = key === "avg_score";
          return (
            <div key={key} className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none`} />
              <div className="flex items-center gap-4">
                <div className={`p-3.5 ${bg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${isScore ? "text-green-600" : key === "total_analyses" ? "text-[#2DC08D]" : "text-blue-600"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{displayValue}</h3>
                </div>
              </div>
              {isScore && value != null && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600 font-medium">{value >= 80 ? "Excellent" : value >= 60 ? "Good" : "Needs Work"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Analyses */}
      {stats.recent_analyses?.length > 0 && (
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-[#2DC08D] rounded-full" />
                Recent Analyses
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Last {stats.recent_analyses.length} results</span>
              </div>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resume</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recent_analyses.map((item, i) => (
                  <tr key={i} className="bg-white hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <FileText className="w-4 h-4 text-[#2DC08D]" />
                        </div>
                        <span className="font-medium text-slate-900">{item.filename || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.date ? new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700">
                        <TrendingUp className="w-3 h-3" />
                        {item.score ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty state for no recent analyses */}
      {(!stats.recent_analyses || stats.recent_analyses.length === 0) && (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <BarChart3 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No Recent Analyses</h3>
            <p className="text-sm text-slate-400 max-w-sm">Upload a resume to get started with your first analysis.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
