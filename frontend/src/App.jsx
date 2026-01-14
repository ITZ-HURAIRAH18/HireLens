import { useState } from "react";
import ChatBot from "./components/ChatBot";
import "./App.css";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const handleSessionStart = (data) => {
    setSessionId(data.session_id);
    setAnalysis(data.ai_analysis);
  };

  return (
    <div className="app">
      <ChatBot 
        sessionId={sessionId} 
        onSessionStart={handleSessionStart}
        initialAnalysis={analysis}
      />
    </div>
  );
}

export default App;
