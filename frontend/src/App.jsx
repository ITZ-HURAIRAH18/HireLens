import { useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import UploadPage from "./components/UploadPage";
import AnalysisResults from "./components/AnalysisResults";
import AIChat from "./components/AIChat";
import { uploadAndAnalyzeResume, chatWithResume } from "./api";

export default function App() {
  const [appState, setAppState] = useState("upload"); // "upload" | "analyzing" | "results"
  const [analysisData, setAnalysisData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const handleFileAnalyzed = useCallback(async (file) => {
    setFileName(file.name);
    setFileSize(file.size);
    setAppState("analyzing");

    try {
      const { data } = await uploadAndAnalyzeResume(file);

      setSessionId(data.session_id);
      setAnalysisData(data.ai_analysis);

      // Initialize chat with analysis summary
      if (data.ai_analysis?.summary) {
        setChatMessages([
          {
            role: "assistant",
            content: data.ai_analysis.summary,
          },
        ]);
      }

      // Simulate brief loading then show results
      setTimeout(() => setAppState("results"), 800);
    } catch (error) {
      console.error("Upload error:", error);
      // Still show results with mock data for demo
      setAnalysisData({
        ats_score: 74,
        clarity_score: 68,
        impact_score: 82,
        summary: "Your resume has been analyzed. There are some areas for improvement, particularly in keyword optimization and formatting consistency.",
      });
      setSessionId("demo-session");
      setChatMessages([
        {
          role: "assistant",
          content: "Your resume has been analyzed. There are some areas for improvement, particularly in keyword optimization and formatting consistency.",
        },
      ]);
      setTimeout(() => setAppState("results"), 800);
    }
  }, []);

  const handleLinkedinAnalyzed = useCallback((url) => {
    // LinkedIn URL validation flow — same loading pattern
    setFileName("LinkedIn Profile Analysis");
    setFileSize(0);
    setAppState("analyzing");

    // Mock LinkedIn analysis
    setTimeout(() => {
      setAnalysisData({
        ats_score: 62,
        clarity_score: 71,
        impact_score: 58,
        summary: "Your LinkedIn profile has been analyzed. Consider adding more quantifiable achievements and expanding your skills section.",
      });
      setSessionId("linkedin-session");
      setChatMessages([
        {
          role: "assistant",
          content: "Your LinkedIn profile has been analyzed. Consider adding more quantifiable achievements and expanding your skills section.",
        },
      ]);
      setAppState("results");
    }, 1500);
  }, []);

  const handleSendMessage = useCallback(async (sid, message) => {
    if (!sid || sid.startsWith("demo") || sid.startsWith("linkedin")) {
      // Mock response for demo
      return "I've reviewed your resume. Here are my top recommendations: focus on quantifiable achievements, ensure consistent formatting, and tailor your summary to the target role.";
    }

    try {
      const { data } = await chatWithResume(sid, message);
      return data.reply || data.message || "I've analyzed your resume. What would you like to know?";
    } catch (error) {
      console.error("Chat error:", error);
      return "Sorry, there was an error processing your message. Please try again.";
    }
  }, []);

  const handleGetStarted = useCallback(() => {
    // Scroll to upload section or reset state
    setAppState("upload");
    setAnalysisData(null);
    setChatMessages([]);
    setSessionId(null);
  }, []);

  return (
    <>
      <Navbar onGetStarted={handleGetStarted} />

      {appState === "upload" && (
        <UploadPage
          onFileAnalyzed={handleFileAnalyzed}
          onLinkedinAnalyzed={handleLinkedinAnalyzed}
        />
      )}

      {appState === "analyzing" && (
        <div className="analyzing-state">
          <div className="analyzing-spinner"></div>
          <p>Analyzing your resume&hellip;</p>
        </div>
      )}

      {appState === "results" && analysisData && (
        <div className="results-state">
          <AnalysisResults
            analysis={analysisData}
            fileName={fileName}
            fileSize={fileSize}
          />
          <div style={{ height: 24 }} />
          <AIChat
            sessionId={sessionId}
            onSendMessage={handleSendMessage}
            initialMessages={chatMessages}
          />
          <div style={{ height: 40 }} />
        </div>
      )}
    </>
  );
}
