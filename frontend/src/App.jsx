import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import MainLayout from "./components/layout/MainLayout";
import UploadPage from "./components/UploadPage";
import AnalysisResults from "./components/AnalysisResults";
import Dashboard from "./components/Dashboard";
import AISuggestions from "./components/AISuggestions";
import History from "./components/History";
import Compare from "./components/Compare";
import Settings from "./components/Settings";
import Auth from "./components/Auth";
import { useAuth } from "./lib/auth";
import { uploadAndAnalyzeResume } from "./api";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <Skeleton height={40} width={250} />
        <Skeleton height={20} count={3} />
        <Skeleton height={200} />
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <Skeleton height={40} width={250} />
        <Skeleton height={20} count={3} />
        <Skeleton height={200} />
      </div>
    </div>
  );
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const [analysisData, setAnalysisData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const { user } = useAuth();

  const handleFileAnalyzed = useCallback(async (file) => {
    setFileName(file.name);
    setFileSize(file.size);
    try {
      const { data } = await uploadAndAnalyzeResume(file);
      setAnalysisData(data.ai_analysis);
      setSessionId(data.session_id);
    } catch (error) {
      console.error("Upload error:", error);
      setAnalysisData(null);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Auth mode="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Auth mode="register" /></PublicRoute>} />
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<UploadPage onFileAnalyzed={handleFileAnalyzed} />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analysis" element={
                  analysisData ? <AnalysisResults analysis={analysisData} fileName={fileName} /> : <div className="text-center py-20 text-slate-400">Upload a resume first.</div>
                } />
                <Route path="/suggestions" element={<AISuggestions sessionId={sessionId} />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
