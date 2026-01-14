import { useState } from "react";
import { chatWithResume } from "../api";

const ChatBot = ({ sessionId }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");

    try {
      const res = await chatWithResume(sessionId, message);

      setChat(res.data.chat_history);
    } catch (err) {
      console.error(err);
      alert("Chat error");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={msg.role === "user" ? "user-msg" : "bot-msg"}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about your resume..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
