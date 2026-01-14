import { useState } from "react";
import { uploadAndAnalyzeResume, chatWithResume } from "../api";
import "../styles/resume-chat.css";

export default function ResumeChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = await uploadAndAnalyzeResume(file);

    setMessages([
      {
        role: "assistant",
        content: `✅ Resume analyzed!\n\n🧠 Summary:\n${result.summary}\n\n📊 ATS Score: ${result.ats_score}/100`
      }
    ]);

    setUploaded(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input }
    ]);

    const res = await chatWithResume(input);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: res.reply }
    ]);

    setInput("");
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        🤖 AI Resume Assistant
      </header>

      <div className="chat-body">
        {!uploaded && (
          <div className="upload-box">
            <label className="upload-btn">
              Upload Resume
              <input type="file" hidden onChange={handleUpload} />
            </label>
            <p>PDF / DOCX • Max 2MB</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your resume..."
          disabled={!uploaded}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}
