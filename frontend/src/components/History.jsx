import { useState, useEffect } from "react";
import { Search, FileText } from "lucide-react";
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
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analysis History</h1>
        <p className="mt-2 text-slate-500 text-sm">View and manage your past resume analyses.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search resumes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2DC08D] focus:border-transparent" />
            </div>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton height={12} width={120} />
                <Skeleton height={12} width={80} />
                <Skeleton height={12} width={60} />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 py-3 border-b border-slate-100">
                  <Skeleton height={16} width="40%" />
                  <Skeleton height={16} width="25%" />
                  <Skeleton height={24} width={50} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-5 bg-slate-50 rounded-full mb-5">
                <FileText className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-1">No Analyses Yet</h3>
              <p className="text-base text-slate-400 max-w-sm">Upload a resume to get started. Your analysis history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr><th className="px-6 py-4 font-semibold">Resume Name</th><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Score</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item, i) => (
                    <tr key={i} className="bg-white hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.filename || "Unknown"}</td>
                      <td className="px-6 py-4">{item.date ? new Date(item.date).toLocaleDateString() : "—"}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md font-medium text-xs ${(item.score || 0) >= 80 ? "bg-green-100 text-green-700" : "bg-emerald-100 text-emerald-700"}`}>{item.score ?? "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
