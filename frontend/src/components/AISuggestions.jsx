import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Loader2, FileText, Target, Shield, FileSignature, Users, GitCompare, Map, MessageCircle } from "lucide-react";
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
  { id: "chat", label: "General Chat", icon: Sparkles, desc: "Ask anything about your resume or career" },
];

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
      <div className="p-5 bg-emerald-50 rounded-full mb-6">
        <Sparkles className="w-10 h-10 text-[#2DC08D]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">No Resume Uploaded</h2>
      <p className="text-base text-slate-500 max-w-md">Upload a resume first to unlock AI agents that can analyze, optimize, and provide suggestions for your career.</p>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-4xl mx-auto">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Suggestions</h1>
        <p className="mt-2 text-slate-500 text-sm">Choose an AI agent below to get started.</p>
      </div>
      {error && <div className="flex-shrink-0 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
      <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          const isActive = selectedAgent === agent.id;
          return (
            <button key={agent.id} onClick={() => runAgent(agent.id)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-left transition-all ${isActive ? "border-[#2DC08D] bg-emerald-50 ring-2 ring-[#2DC08D]/20" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}>
              <div className={`p-2 rounded-lg ${isActive ? "bg-[#2DC08D] text-white" : "bg-slate-100 text-slate-600"}`}><Icon className="w-5 h-5" /></div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{agent.label}</span>
              <span className="text-[10px] text-slate-400 text-center leading-tight hidden sm:block">{agent.desc}</span>
            </button>
          );
        })}
      </div>
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white shadow-sm border-slate-200">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.length === 0 && !isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-slate-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-600">Click an agent above</p>
                <p className="text-sm mt-1">Each agent specializes in a different task</p>
              </motion.div>
            )}
            {messages.map((msg, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1"><Sparkles className="w-4 h-4 text-[#2DC08D]" /></div>}
                <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 ${msg.role === "user" ? "bg-slate-900 text-white" : "bg-slate-50 border border-slate-100 text-slate-900"}`}>
                  {msg.agent && <div className="text-xs font-semibold text-[#2DC08D] mb-2 uppercase tracking-wider">{AGENTS.find(a => a.id === msg.agent)?.label || msg.agent}</div>}
                  {msg.output && msg.agent !== "chat" && msg.agent !== "cover_letter" ? (
                    <AgentOutputRenderer agent={msg.agent} output={msg.output} />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                  )}
                </div>
                {msg.role === "user" && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1 border border-slate-300"><User className="w-4 h-4 text-slate-500" /></div>}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1"><Sparkles className="w-4 h-4 text-[#2DC08D]" /></div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-3xl mx-auto">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={selectedAgent ? `Ask ${AGENTS.find(a => a.id === selectedAgent)?.label}...` : "Type a message..."} className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#2DC08D] focus:border-transparent block p-4 transition-shadow" />
            <Button type="submit" disabled={!input.trim() || isTyping} className="h-[54px] w-[54px] rounded-xl flex-shrink-0">{isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
