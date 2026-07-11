import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2,
  ChevronDown, Check, Circle, X, BarChart3, Search, MessageSquare,
  Menu, X as XIcon
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAuth } from "../lib/auth";
import FadeIn from "./animations/FadeIn";
import AnimatedCounter from "./animations/AnimatedCounter";
import AnimatedProgressRing from "./animations/AnimatedProgressRing";
import MarqueeRow from "./animations/MarqueeRow";

const checkItems = [
  { label: "ATS Parse Rate", status: "pass" },
  { label: "Quantifying Impact", status: "pass" },
  { label: "Spelling & Grammar", status: "pass" },
  { label: "Format & Brevity", status: "warning" },
  { label: "Sections", status: "error" },
  { label: "Skills", status: "pass" },
];

const trustBrands = ["Google", "Meta", "Amazon", "Microsoft", "Stripe"];

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const fadeItem = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

function StatusIcon({ status }) {
  if (status === "pass") return <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />;
  if (status === "warning") return <Circle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
  return <X className="w-3.5 h-3.5 text-red-500 shrink-0" />;
}

function StatusBadge({ status }) {
  const map = { pass: "success", warning: "warning", error: "error" };
  const label = status === "pass" ? "Pass" : status === "warning" ? "Warn" : "Fail";
  return <Badge variant={map[status]} className="text-[10px] px-1.5 py-0">{label}</Badge>;
}

function ProductMockup() {
  const reduced = useReducedMotion();

  const renderChecklist = () => checkItems.map((item) => (
    <div key={item.label} className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        <StatusIcon status={item.status} />
        <span className="text-xs text-slate-700 truncate">{item.label}</span>
      </div>
      <StatusBadge status={item.status} />
    </div>
  ));

  return (
    <div className="w-full rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-300" />
          <div className="w-3 h-3 rounded-full bg-amber-300" />
          <div className="w-3 h-3 rounded-full bg-green-300" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-md px-3 py-1">
            <span className="font-bold">
              <span className="text-slate-800">Hire</span><span className="text-[#2DC08D]">Lens</span>
            </span>
            <span className="mx-1">·</span>
            <span>Resume Analysis</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex gap-5">
          <div className="flex flex-col items-center gap-1.5">
            <AnimatedProgressRing percentage={78} />
            <span className="text-xs font-medium text-slate-500">Resume Score</span>
          </div>
          {reduced ? (
            <div className="flex-1 space-y-1">
              {renderChecklist()}
            </div>
          ) : (
            <motion.div
              className="flex-1 space-y-1"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-80px", amount: 0.2 }}
            >
              {checkItems.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeItem}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon status={item.status} />
                    <span className="text-xs text-slate-700 truncate">{item.label}</span>
                  </div>
                  <StatusBadge status={item.status} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Homepage({ onFileAnalyzed }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or DOCX file.");
      return false;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("File size must be under 2MB.");
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (validateFile(f)) setFile(f);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (validateFile(f)) setFile(f);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !onFileAnalyzed) return;
    setUploading(true);
    try {
      await onFileAnalyzed(file);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
        <FadeIn delay={0} y={-12}>
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-10">
                <a href="/" className="flex items-center gap-0">
                  <span className="text-xl font-bold text-[#0F1115]">Hire</span>
                  <span className="text-xl font-bold text-[#2DC08D]">Lens</span>
                </a>
                <nav className="hidden md:flex items-center gap-8">
                  <a href="/" className="text-sm font-medium text-[#5B6470] hover:text-[#0F1115] transition-colors duration-200">
                    Resume Checker
                  </a>
                  <div className="relative">
                    <button
                      onClick={() => setToolsOpen(!toolsOpen)}
                      className="flex items-center gap-1 text-sm font-medium text-[#5B6470] hover:text-[#0F1115] transition-colors duration-200"
                    >
                      Tools <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
                    </button>
                    {toolsOpen && (
                      <div className="absolute top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                        <a href="/compare" className="block px-4 py-2 text-sm text-[#5B6470] hover:bg-slate-50">Resume Enhancer</a>
                        <a href="/suggestions" className="block px-4 py-2 text-sm text-[#5B6470] hover:bg-slate-50">AI Agents</a>
                        <a href="/history" className="block px-4 py-2 text-sm text-[#5B6470] hover:bg-slate-50">History</a>
                      </div>
                    )}
                  </div>
                  <a href="/dashboard" className="text-sm font-medium text-[#5B6470] hover:text-[#0F1115] transition-colors duration-200">
                    For Organizations
                  </a>
                  <a href="/pricing" className="text-sm font-medium text-[#5B6470] hover:text-[#0F1115] transition-colors duration-200">
                    Pricing
                  </a>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(user ? "/" : "/login")}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => document.getElementById("upload-zone")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Get Started
                </Button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#5B6470]">
                  {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden pb-4 border-t border-slate-100 pt-4 space-y-3"
              >
                <a href="/" className="block text-sm font-medium text-[#5B6470]">Resume Checker</a>
                <a href="/compare" className="block text-sm font-medium text-[#5B6470]">Resume Enhancer</a>
                <a href="/suggestions" className="block text-sm font-medium text-[#5B6470]">AI Agents</a>
                <a href="/dashboard" className="block text-sm font-medium text-[#5B6470]">For Organizations</a>
                <a href="/pricing" className="block text-sm font-medium text-[#5B6470]">Pricing</a>
              </motion.div>
            )}
          </div>
        </FadeIn>
      </header>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="space-y-8">
              <FadeIn delay={0}>
                <div className="inline-flex items-center gap-1.5 bg-[#2DC08D]/10 text-[#2DC08D] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#2DC08D]/20">
                  <span className="w-2 h-2 rounded-full bg-[#2DC08D]" />
                  AI-POWERED RESUME ANALYSIS
                </div>
              </FadeIn>

              <FadeIn delay={0.1} y={20}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0F1115] leading-[1.1]">
                  Your resume,{" "}
                  <span className="text-[#2DC08D] italic font-black">decoded.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2} y={20}>
                <p className="text-lg sm:text-xl text-[#5B6470] max-w-lg leading-relaxed">
                  Get instant AI feedback, ATS scoring, and a personal career coach to help you land more interviews.
                </p>
              </FadeIn>

              <FadeIn delay={0.3} y={20}>
                <div
                  id="upload-zone"
                  className={`border-2 border-dashed rounded-2xl p-8 transition-colors duration-150 ${
                    dragActive ? "border-[#2DC08D] bg-[#2DC08D]/5" : "border-[#E5E7EB]"
                  }`}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3.5 bg-[#2DC08D]/10 rounded-full">
                      <UploadCloud className="w-8 h-8 text-[#2DC08D]" />
                    </div>

                    {!file ? (
                      <>
                        <div>
                          <p className="text-base font-semibold text-[#0F1115]">Drop your resume here</p>
                          <p className="text-sm text-[#9AA3AF] mt-1">or click to browse files</p>
                        </div>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                        >
                          <UploadCloud className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept=".pdf,.docx"
                        />
                        <p className="text-xs text-[#9AA3AF]">PDF · DOCX · Max 2MB</p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-2.5 bg-green-50 rounded-full border border-green-100">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F1115] flex items-center gap-2">
                            {file.name}
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </p>
                          <p className="text-xs text-[#9AA3AF] mt-0.5">
                            {(file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setFile(null)}>
                            Remove
                          </Button>
                          <Button size="sm" onClick={handleAnalyze} disabled={uploading}>
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            {uploading ? "Analyzing..." : "Analyze"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </div>

            <FadeIn delay={0.4} y={24} className="hidden lg:block sticky top-28">
              <ProductMockup />
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F1115]">How it works</h2>
              <p className="text-[#5B6470] mt-2">Three simple steps to a better resume</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Upload", desc: "Drop your resume in PDF or DOCX format. We support any layout." },
              { step: "02", title: "AI Analysis", desc: "Our AI parses your resume against 9 ATS criteria in seconds." },
              { step: "03", title: "Get Feedback", desc: "Receive a detailed score report with actionable improvement tips." },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.12} y={20}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#2DC08D]/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-sm font-bold text-[#2DC08D]">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-[#0F1115] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#5B6470]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <FadeIn>
            <p className="text-xs text-[#9AA3AF] uppercase tracking-wider text-center mb-6">
              Trusted by job seekers at
            </p>
          </FadeIn>
          <FadeIn>
            <MarqueeRow items={trustBrands} />
          </FadeIn>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: "ATS Score", desc: "Pass filters", color: "#2DC08D" },
              { icon: Search, title: "Gap Analysis", desc: "Missing keywords", color: "#2DC08D" },
              { icon: MessageSquare, title: "AI Coach", desc: "Ask anything", color: "#2DC08D" },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1} y={16}>
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 rounded-full bg-[#2DC08D]/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-[#2DC08D]" />
                  </div>
                  <h3 className="font-semibold text-[#0F1115] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#5B6470]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB] py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-0">
            <span className="text-sm font-bold text-[#0F1115]">Hire</span>
            <span className="text-sm font-bold text-[#2DC08D]">Lens</span>
          </div>
          <p className="text-xs text-[#9AA3AF]">&copy; 2026 HireLens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
