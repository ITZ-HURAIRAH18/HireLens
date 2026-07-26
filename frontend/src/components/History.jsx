import { useState, useEffect } from "react";
import { Search, FileText, TrendingUp, Clock, Sparkles, ChevronDown } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { getHistory } from "../api";

export default function History() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getHistory()
      .then((res) => setData(res.data?.items || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter((item) =>
    (item.filename || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#2DC08D] text-sm font-semibold uppercase tracking-widest mb-1">
          <Sparkles className="w-4 h-4" /> History
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analysis History</h1>
        <p className="mt-1.5 text-slate-500 text-sm">View and manage your past resume analyses.</p>
      </div>

      <Card className="border-slate-100 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2DC08D] focus:border-transparent transition-shadow placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton height={12} width={120} />
              <Skeleton height={12} width={80} />
              <Skeleton height={12} width={60} />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-slate-100">
                <Skeleton height={16} width="40%" />
                <Skeleton height={16} width="25%" />
                <Skeleton height={24} width={50} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl mb-5">
              <FileText className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-1">
              {search ? "No Matches Found" : "No Analyses Yet"}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {search ? `No results for "${search}". Try a different search term.` : "Upload a resume to get started. Your analysis history will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resume Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item, i) => {
                  const score = item.score ?? null;
                  const scoreColor = score >= 80 ? "bg-green-50 text-green-700" : score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";
                  return (
                    <tr key={i} className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <FileText className="w-4 h-4 text-[#2DC08D]" />
                          </div>
                          <span className="font-medium text-slate-900">{item.filename || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.date ? new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {score != null ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${scoreColor}`}>
                            <TrendingUp className="w-3 h-3" />
                            {score}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
