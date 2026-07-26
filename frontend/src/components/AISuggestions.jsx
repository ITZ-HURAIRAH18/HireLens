import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Loader2, FileText, Target, Shield, FileSignature, Users, GitCompare, Map, MessageCircle, Zap, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { invokeAgent } from "../api";
import { AgentOutputRenderer } from "./AgentOutputRenderer";

const AGENTS = [
  { id: "analyze", label: "Resume Analysis", icon: FileText, desc: "Full resume analysis with strengths, weaknesses & scores" },
  { id: "ats", label: "ATS Check", icon: Shield, desc: "Check ATS compatibility & get optimization fixes" },
  { id: "job_match", label: "Job Match", icon: Target, desc: "Match your resume against a job description" },
  { id: "cover_letter", label: "Cover Letter", icon: FileSignature, desc: "Generate tailored cover letters" },
  { id: "interview_prep", label: "Interview Prep", icon: Users, desc: "Practice questions & preparation tips" },
  { id: "mock_interview", label: "Mock Interview", icon: MessageCircle, desc: "Get feedback on your interview answers" },
  { id: "career_path", label: "Career Path", icon: Map, desc: "Personalized career roadmap & skill gaps" },
  { id: "chat", label: "General Chat", icon: Zap, desc: "Ask anything about your resume or career" },
];

function AgentCard({ agent, isActive, onClick }) {
  const Icon = agent.icon;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-5 rounded-xl border text-left transition-all duration-200 ${
        isActive
          ? "border-[#2DC08D] bg-gradient-to-b from-emerald-50 to-white ring-2 ring-[#2DC08D]/20 shadow-md"
          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
      }`}
    >
      <div className={`p-2.5 rounded-xl transition-all duration-200 ${isActive ? "bg-gradient-to-br from-[#2DC08D] to-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-500"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-center">
        <span className={`text-xs font-bold block ${isActive ? "text-[#2DC08D]" : "text-slate-700"}`}>{agent.label}</span>
        <span className="text-[10px] text-slate-400 leading-tight mt-1 block">{agent.desc}</span>
      </div>
    </motion.button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2DC08D] to-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-md px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2DC08D] animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#2DC08D] animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#2DC08D] animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isLast }) {
  const agentInfo = AGENTS.find((a) => a.id === msg.agent);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      {msg.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2DC08D] to-emerald-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "order-1" : "order-2"}`}>
        {msg.agent && msg.role === "assistant" && (
          <div className="text-[11px] font-semibold text-[#2DC08D] mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {agentInfo?.label || msg.agent}
          </div>
        )}
        <div className={`rounded-2xl p-4 text-sm leading-relaxed ${
          msg.role === "user"
            ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md rounded-tr-md"
            : "bg-white border border-slate-100 shadow-sm rounded-tl-md text-slate-800"
        }`}>
          {msg.role === "assistant" && msg.output && msg.agent !== "chat" && msg.agent !== "cover_letter" ? (
            <AgentOutputRenderer agent={msg.agent} output={msg.output} />
          ) : (
            <div className="whitespace-pre-wrap">{msg.content}</div>
          )}
        </div>
      </div>
      {msg.role === "user" && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <User className="w-4 h-4 text-slate-600" />
        </div>
      )}
    </motion.div>
  );
}

export default function AISuggestions({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const runAgent = async (agentId, userMsg = "") => {
    setSelectedAgent(agentId);

    if (agentId === "job_match" && !userMsg.trim()) {
      setError("Please paste a job description in the input field first, then click Job Match.");
      setIsTyping(false);
      return;
    }
    if (agentId === "mock_interview" && !userMsg.trim()) {
      setError("Please type your interview answer in the input field first, then click Mock Interview.");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setError(null);
    try {
      const payload = {
        session_id: sessionId || "suggestions-session",
        intent: agentId,
        resume_text: "",
        resume_data: {},
        job_description: "",
        user_message: userMsg,
      };

      if (agentId === "job_match" || agentId === "cover_letter") {
        payload.job_description = userMsg;
      }

      const { data } = await invokeAgent(payload);

      if (data.error) {
        setError(data.error);
        setIsTyping(false);
        return;
      }

      const output = data.output || {};

      if (!output || Object.keys(output).length === 0) {
        setError(`Agent "${agentId}" returned no data. Make sure a resume is uploaded and try again.`);
        setIsTyping(false);
        return;
      }

      const textFallback = output.primary_letter || output.reply || "";
      setMessages(prev => [...prev, { role: "assistant", agent: agentId, output, content: textFallback }]);
    } catch (err) {
      setError(`Agent "${agentId}" failed. Please try again.`);
    }
    setIsTyping(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    if (selectedAgent && selectedAgent !== "chat") {
      await runAgent(selectedAgent, userMsg);
    } else {
      await runAgent("chat", `Give me suggestions to improve my resume. ${userMsg}`);
    }
  };

  if (!sessionId) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl mb-6 shadow-sm">
        <Sparkles className="w-12 h-12 text-[#2DC08D]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No Resume Uploaded</h2>
      <p className="text-base text-slate-500 max-w-md leading-relaxed">Upload a resume first to unlock AI agents that can analyze, optimize, and provide suggestions for your career.</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center gap-2 text-[#2DC08D] text-sm font-semibold uppercase tracking-widest mb-1">
          <Zap className="w-4 h-4" /> AI Agents
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Suggestions</h1>
        <p className="mt-1.5 text-slate-500 text-sm">Choose an AI agent below or type a message to get started.</p>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 mb-5 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-red-500 text-xs font-bold">!</span>
          </div>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Agent Grid */}
      <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} isActive={selectedAgent === agent.id} onClick={() => runAgent(agent.id)} />
        ))}
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-white border-slate-100 shadow-sm rounded-2xl">
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.length === 0 && !isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl mb-5">
                  <Sparkles className="w-10 h-10 text-[#2DC08D]" />
                </div>
                <p className="text-lg font-semibold text-slate-700">Click an agent above</p>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-sm">Each agent specializes in a different task — select one or type a message to chat with AI.</p>
              </motion.div>
            )}
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} isLast={idx === messages.length - 1} />
            ))}
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedAgent ? `Ask ${AGENTS.find(a => a.id === selectedAgent)?.label}...` : "Type a message..."}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#2DC08D] focus:border-transparent block p-4 pr-12 transition-shadow placeholder:text-slate-400"
              />
              {selectedAgent && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#2DC08D] bg-emerald-50 px-2 py-1 rounded-md">
                    <Zap className="w-3 h-3" />
                    {AGENTS.find(a => a.id === selectedAgent)?.label}
                  </div>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-[54px] w-[54px] rounded-xl flex-shrink-0 bg-gradient-to-br from-[#2DC08D] to-emerald-600 hover:from-[#26A37A] hover:to-emerald-700 shadow-sm disabled:opacity-40"
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
