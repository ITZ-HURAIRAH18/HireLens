import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import MainLayout from "./components/layout/MainLayout";
import Homepage from "./components/Homepage";
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
  if (user) return <Navigate to="/upload" replace />;
  return children;
}

function AppContent() {
  const [analysisData, setAnalysisData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileAnalyzed = useCallback(async (file) => {
    setFileName(file.name);
    setFileSize(file.size);
    try {
      const { data } = await uploadAndAnalyzeResume(file);
      setAnalysisData(data.ai_analysis);
      setSessionId(data.session_id);
      navigate("/analysis");
    } catch (error) {
      console.error("Upload error:", error);
      setAnalysisData(null);
    }
  }, [navigate]);

  const analysisFallback = (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-5 bg-emerald-50 rounded-full mb-6">
        <FileText className="w-10 h-10 text-[#2DC08D]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">No Analysis Yet</h2>
      <p className="text-base text-slate-500 max-w-md">Upload a resume from the home page to see your AI-powered ATS analysis and score breakdown.</p>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Auth mode="login" /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Auth mode="register" /></PublicRoute>} />
      <Route path="/" element={<Homepage onFileAnalyzed={handleFileAnalyzed} />} />
      <Route path="/upload" element={<ProtectedRoute><MainLayout><UploadPage onFileAnalyzed={handleFileAnalyzed} /></MainLayout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
      <Route path="/analysis" element={<ProtectedRoute><MainLayout>{analysisData ? <AnalysisResults analysis={analysisData} fileName={fileName} /> : analysisFallback}</MainLayout></ProtectedRoute>} />
      <Route path="/suggestions" element={<ProtectedRoute><MainLayout><AISuggestions sessionId={sessionId} /></MainLayout></ProtectedRoute>} />
      <Route path="/compare" element={<ProtectedRoute><MainLayout><Compare /></MainLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><MainLayout><History /></MainLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default AppRoutes;