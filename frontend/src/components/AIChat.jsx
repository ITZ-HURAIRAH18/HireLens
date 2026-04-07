import { useState, useRef, useEffect } from "react";
import "./AIChat.css";

const SUGGESTION_CHIPS = [
  "Fix formatting issues",
  "Rewrite my summary",
  "Tailor for job description",
  "What's my weakest section",
];

export default function AIChat({ sessionId, onSendMessage, initialMessages }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages || []);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setIsThinking(true);

    if (onSendMessage) {
      try {
        const reply = await onSendMessage(sessionId, userText);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply || "I've analyzed your resume. What would you like to know?" },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, there was an error processing your message. Please try again." },
        ]);
      }
    }

    setIsThinking(false);
  };

  const handleChipClick = (chip) => {
    setInput(chip);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="ai-chat">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-avatar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7l-3 3.5L9 16c-2-1.5-4-4-4-7a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <span className="chat-title">ResumeCoach</span>
        <div className="chat-status">
          <span className="status-dot"></span>
          <span className="status-text">Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msg-bubble-wrapper msg-bubble-wrapper--${msg.role}`}
          >
            {msg.role === "assistant" ? (
              <div className="msg-ai">
                {typeof msg.content === "string"
                  ? msg.content.split("\n").map((line, j) => {
                      const boldParts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <span key={j}>
                          {boldParts.map((part, k) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return <strong key={k}>{part.slice(2, -2)}</strong>;
                            }
                            return <span key={k}>{part}</span>;
                          })}
                          {j < line.split("\n").length - 1 && <br />}
                        </span>
                      );
                    })
                  : msg.content}
              </div>
            ) : (
              <div className="msg-user">{msg.content}</div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="msg-bubble-wrapper msg-bubble-wrapper--assistant">
            <div className="msg-ai msg-ai--thinking">
              <span className="thinking-dot" style={{ animationDelay: "0s" }}></span>
              <span className="thinking-dot" style={{ animationDelay: "0.15s" }}></span>
              <span className="thinking-dot" style={{ animationDelay: "0.3s" }}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="suggestion-chips">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            className="suggestion-chip"
            onClick={() => handleChipClick(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input Row */}
      <div className="chat-input-row">
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder="Ask anything about your resume&hellip;"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!input.trim() || isThinking}
          aria-label="Send message"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 13,22 11,13 2,9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
