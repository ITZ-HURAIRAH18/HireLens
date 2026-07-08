import { useState, useEffect } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { getDashboard } from "../api";

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
    <div className="space-y-8 fade-up">
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
  if (error) return <div className="text-center py-20 text-red-400">Failed to load: {error}</div>;
  if (!stats) return <div className="text-center py-20 text-slate-400">No data yet. Upload a resume to get started.</div>;

  return (
    <div className="space-y-8 fade-up">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="mt-2 text-slate-500 text-sm">Overview of your resume analysis activity.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckCircle2 className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Average ATS Score</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.avg_score ?? "—"}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-orange-50 text-[#d97757] rounded-full"><FileText className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Analyses</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.total_analyses ?? 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><CheckCircle2 className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Resumes Uploaded</p>
              <h3 className="text-3xl font-bold text-slate-900">{stats.total_resumes ?? 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
      {stats.recent_analyses?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Analyses</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-medium">File</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_analyses.map((item, i) => (
                  <tr key={i} className="bg-white border-b border-slate-100">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.filename || "Unknown"}</td>
                    <td className="px-6 py-4">{item.date ? new Date(item.date).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-md font-medium text-xs bg-green-100 text-green-700">{item.score ?? "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
