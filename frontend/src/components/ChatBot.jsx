import { useEffect, useRef, useState } from 'react';
import { chatWithResume, uploadAndAnalyzeResume } from '../api';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export default function ChatBot({ sessionId, onSessionStart, initialAnalysis }) {
  /* ---------- state ---------- */
  const [message, setMessage]   = useState('');
  const [chat, setChat]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [file, setFile]         = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const fileInputRef = useRef(null);

  /* ---------- effects ---------- */
  // auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Add initial analysis to chat if available
  useEffect(() => {
    if (initialAnalysis && chat.length === 0) {
      const welcomeMsg = {
        role: 'assistant',
        content: {
          type: 'analysis',
          score: initialAnalysis.ats_score,
          summary: initialAnalysis.summary
        },
        isAnalysis: true
      };
      setChat([welcomeMsg]);
    }
  }, [initialAnalysis]);

  /* ---------- helpers ---------- */
  const isValid = (f) => {
    if (!f) return 'No file selected';
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type))
      return 'Only .pdf or .docx';
    if (f.size > MAX_BYTES) return 'File must be ≤ 2 MB';
    return '';
  };

  /* ---------- handlers ---------- */
  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    const msg = isValid(f);
    if (msg) {
      setUploadError(msg);
      return;
    }
    setUploadError('');
    setFile(f);
    handleUpload(f);
  };

  const handleUpload = async (selectedFile) => {
    const fileToUpload = selectedFile || file;
    const msg = isValid(fileToUpload);
    if (msg) {
      setUploadError(msg);
      return;
    }

    setUploading(true);
    setUploadError('');
    
    // Add upload message to chat
    const uploadMsg = {
      role: 'user',
      content: `📎 Uploading resume: ${fileToUpload.name}`,
      isUpload: true
    };
    setChat((prev) => [...prev, uploadMsg]);

    try {
      const { data } = await uploadAndAnalyzeResume(fileToUpload);
      onSessionStart(data);
      
      // Add analysis result to chat
      const analysisMsg = {
        role: 'assistant',
        content: {
          type: 'analysis',
          score: data.ai_analysis.ats_score,
          summary: data.ai_analysis.summary
        },
        isAnalysis: true
      };
      setChat((prev) => [...prev, analysisMsg]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Upload failed. Try again.');
      setChat((prev) => prev.slice(0, -1)); // Remove upload message
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = { role: 'user', content: message };

    /* optimistic ui */
    setChat((prev) => [...prev, userMsg]);
    setMessage('');
    setError(null);
    setLoading(true);

    try {
      const { data } = await chatWithResume(sessionId, userMsg.content);
      setChat(data.chat_history);
    } catch (err) {
      setChat((prev) => prev.slice(0, -1)); // rollback
      setError(err?.message || 'Chat error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- formatting helpers ---------- */
  const formatMessage = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, i) => {
      // Handle bold text
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formatted = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      
      return (
        <span key={i}>
          {formatted}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  const formatSummary = (summary) => {
    if (!summary) return null;
    
    // Split into paragraphs
    const paragraphs = summary.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((para, i) => (
      <p key={i} className="chatbot__paragraph">
        {para.split('\n').map((line, j) => (
          <span key={j}>
            {line}
            {j < para.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };

  /* ---------- render ---------- */
  return (
    <section className="chatbot">
      {/* Header */}
      <div className="chatbot__header">
        <h2 className="chatbot__title">
          <span className="chatbot__icon">💼</span>
          AI Resume Assistant
        </h2>
        <p className="chatbot__subtitle">Upload your resume and chat with AI</p>
      </div>

      <div className="chatbot__viewport">
        {chat.length === 0 && !loading && !uploading && (
          <div className="chatbot__welcome">
            <div className="chatbot__welcome-icon">🤖</div>
            <h3 className="chatbot__welcome-title">Welcome to AI Resume Assistant!</h3>
            <p className="chatbot__welcome-text">
              {sessionId 
                ? "Ask me anything about your résumé." 
                : "Upload your resume to get started. I'll analyze it and help you improve it!"}
            </p>
            {!sessionId && (
              <div className="chatbot__upload-prompt">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="chatbot__upload-btn"
                  disabled={uploading}
                >
                  <UploadIcon />
                  Choose Resume File
                </button>
                <p className="chatbot__upload-hint">Supports PDF & DOCX (max 2MB)</p>
              </div>
            )}
          </div>
        )}

        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`chatbot__msg chatbot__msg--${msg.role} ${msg.isAnalysis ? 'chatbot__msg--analysis' : ''} ${msg.isUpload ? 'chatbot__msg--upload' : ''}`}
            aria-label={`${msg.role} message`}
          >
            <div className="chatbot__avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            {msg.isAnalysis ? (
              <div className="chatbot__analysis-card">
                <div className="chatbot__analysis-header">
                  <span className="chatbot__success-icon">✅</span>
                  <h3>Resume Analysis Complete</h3>
                </div>
                
                <div className="chatbot__ats-score">
                  <div className="chatbot__score-label">ATS Score</div>
                  <div className="chatbot__score-value">
                    {msg.content.score || 'N/A'}
                    <span className="chatbot__score-max">/100</span>
                  </div>
                  <div className="chatbot__score-bar">
                    <div 
                      className="chatbot__score-fill" 
                      style={{width: `${msg.content.score || 0}%`}}
                    ></div>
                  </div>
                </div>

                <div className="chatbot__summary">
                  <h4 className="chatbot__summary-title">📝 Professional Summary</h4>
                  <div className="chatbot__summary-content">
                    {formatSummary(msg.content.summary)}
                  </div>
                </div>

                <div className="chatbot__cta">
                  💬 Feel free to ask me anything about your resume!
                </div>
              </div>
            ) : (
              <div className="chatbot__bubble">
                {formatMessage(typeof msg.content === 'string' ? msg.content : msg.content.text || '')}
              </div>
            )}
          </div>
        ))}

        {(loading || uploading) && (
          <div className="chatbot__msg chatbot__msg--assistant">
            <div className="chatbot__avatar">🤖</div>
            <div className="chatbot__bubble chatbot__bubble--loading">
              <span className="chatbot__typing">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <span className="chatbot__loading-text">
                {uploading ? 'Analyzing resume...' : 'Thinking...'}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="chatbot__form">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className="chatbot__file-input"
          disabled={uploading}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="chatbot__attach-btn"
          disabled={uploading || loading}
          aria-label="Upload resume"
          title="Upload resume"
        >
          <AttachIcon />
        </button>

        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={sessionId ? "Ask about your résumé…" : "Upload a resume to start chatting…"}
          className="chatbot__input"
          disabled={loading || !sessionId || uploading}
        />
        
        <button
          type="submit"
          disabled={loading || !message.trim() || !sessionId || uploading}
          className="chatbot__btn"
          aria-label="Send message"
        >
          {loading ? <span className="chatbot__spinner" /> : <SendIcon />}
        </button>
      </form>

      {(error || uploadError) && (
        <div className="chatbot__error">
          {error || uploadError}
          {error && (
            <button type="button" onClick={() => sendMessage()} className="chatbot__retry">
              Retry
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------- svg icons ---------- */
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 13,22 11,13 2,9" />
  </svg>
);

const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);