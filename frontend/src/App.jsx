import { useState } from "react";
import ResumeUpload from "./components/ResumeUpload";
import ChatBot from "./components/ChatBot";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleUploadSuccess = (data) => {
    setSessionId(data.session_id);
    setAnalysis(data.ai_analysis);
  };

  return (
    <div className="app">
      <h1>AI Resume Analyzer 💼</h1>

      {!sessionId ? (
        <ResumeUpload onSuccess={handleUploadSuccess} />
      ) : (
        <>
          <div className="analysis">
            <h3>ATS Score: {analysis.ats_score}</h3>
            <p><b>Summary:</b> {analysis.summary}</p>
          </div>

          <ChatBot sessionId={sessionId} />
        </>
      )}
    </div>
  );
}

export default App;
