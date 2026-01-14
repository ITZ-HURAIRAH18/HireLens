import { useState, useRef, useEffect } from "react";
import { uploadAndAnalyzeResume, chatWithResume } from "../api";
import "../styles/resume-chat.css";

export default function ResumeChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data } = await uploadAndAnalyzeResume(file);

      setSessionId(data.session_id);
      setMessages([
        {
          role: "assistant",
          isAnalysis: true,
          content: {
            summary: data.ai_analysis.summary,
            ats_score: data.ai_analysis.ats_score
          }
        }
      ]);

      setUploaded(true);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading || !sessionId) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await chatWithResume(sessionId, userMessage);
      const reply = data.reply || data.message || "I apologize, but I couldn't process your message.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Sorry, there was an error processing your message. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    if (!text) return null;
    
    // Split by double newlines to create paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    
    return paragraphs.map((para, paraIdx) => {
      const lines = para.split('\n').filter(line => line.trim());
      
      return (
        <div key={paraIdx} className="message-paragraph">
          {lines.map((line, lineIdx) => {
            // Check if line starts with number and dot (numbered list)
            const numberedMatch = line.match(/^(\d+\.)\s+(.*)$/);
            
            let contentToFormat = line;
            let listNumber = null;
            
            if (numberedMatch) {
              listNumber = numberedMatch[1];
              contentToFormat = numberedMatch[2];
            }

            // Handle markdown bold (**text**)
            const parts = contentToFormat.split(/(\*\*.*?\*\*)/g);
            const formatted = parts.map((part, partIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIdx} className="message-bold">{part.slice(2, -2)}</strong>;
              }
              return <span key={partIdx}>{part}</span>;
            });

            if (listNumber) {
              return (
                <div key={lineIdx} className="message-list-item">
                  <span className="message-list-number">{listNumber}</span>
                  <span className="message-list-content">{formatted}</span>
                </div>
              );
            }

            return (
              <div key={lineIdx} className="message-line">
                {formatted}
              </div>
            );
          })}
        </div>
      );
    });
  };

  const formatSummary = (summary) => {
    if (!summary) return null;
    const paragraphs = summary.split('\n\n').filter(p => p.trim());
    return paragraphs.map((para, i) => (
      <p key={i} className="summary-paragraph">
        {para}
      </p>
    ));
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-header-content">
          <span className="chat-header-icon">🤖</span>
          <h1>AI Resume Assistant</h1>
        </div>
      </header>

      <div className="chat-body">
        {!uploaded && !uploading && (
          <div className="upload-box">
            <div className="upload-icon">📄</div>
            <h2 className="upload-title">Upload Your Resume</h2>
            <p className="upload-subtitle">Get instant AI-powered analysis</p>
            <label className="upload-btn">
              <span>Choose File</span>
              <input type="file" accept=".pdf,.docx" hidden onChange={handleUpload} />
            </label>
            <p className="upload-hint">PDF / DOCX • Max 2MB</p>
          </div>
        )}

        {uploading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Analyzing your resume...</p>
          </div>
        )}

        <div className="messages-container">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-wrapper msg-wrapper--${msg.role}`}>
              {msg.isAnalysis ? (
                <div className="analysis-card">
                  <div className="analysis-header">
                    <div className="ai-indicator">
                      <div className="ai-pulse"></div>
                      <span className="ai-icon">🤖</span>
                    </div>
                    <div className="analysis-header-text">
                      <h3>AI Analysis Complete</h3>
                      <p className="analysis-subtitle">Powered by Advanced AI</p>
                    </div>
                  </div>

                  <div className="ats-score-section">
                    <div className="ats-score-label">ATS Score</div>
                    <div className="ats-score-value">
                      {msg.content.ats_score || 'N/A'}
                      <span className="ats-score-max">/100</span>
                    </div>
                  </div>

                  <div className="summary-section">
                    <h4 className="summary-title">📝 Professional Summary</h4>
                    <div className="summary-content">
                      {formatSummary(msg.content.summary)}
                    </div>
                  </div>

                  <div className="cta-section">
                    💬 Feel free to ask me anything about your resume!
                  </div>
                </div>
              ) : (
                <div className={`msg-bubble msg-bubble--${msg.role}`}>
                  {formatMessage(typeof msg.content === 'string' ? msg.content : msg.content.text || '')}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="msg-wrapper msg-wrapper--assistant">
              <div className="msg-bubble msg-bubble--assistant msg-bubble--loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-wrapper">
        <form onSubmit={sendMessage} className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={uploaded ? "Ask about your resume..." : "Upload a resume to start chatting..."}
            disabled={!uploaded || loading}
            className="chat-input-field"
          />
          <button
            type="submit"
            disabled={!uploaded || loading || !input.trim()}
            className="chat-send-btn"
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22,2 13,22 11,13 2,9" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}