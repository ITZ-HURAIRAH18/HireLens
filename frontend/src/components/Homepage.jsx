import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2,
  ChevronDown, Check, Circle, X, BarChart3, Search, MessageSquare,
  Menu, X as XIcon, ArrowRight, Shield, Zap, Sparkles
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../lib/auth";
import FadeIn from "./animations/FadeIn";
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

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 1.2 } },
};

const fadeItem = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
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
    <div key={item.label} className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <StatusIcon status={item.status} />
        <span className="text-xs text-[#5B6470] truncate">{item.label}</span>
      </div>
      <StatusBadge status={item.status} />
    </div>
  ));

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-[#E5E7EB] shadow-lg bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-[#E5E7EB]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-300" />
          <div className="w-3 h-3 rounded-full bg-amber-300" />
          <div className="w-3 h-3 rounded-full bg-green-300" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1 text-xs text-[#9AA3AF] bg-[#FAFAFA] border border-[#E5E7EB] rounded-md px-3 py-1">
            <span className="font-bold">
              <span className="text-[#0F1115]">Hire</span><span className="text-[#2DC08D]">Lens</span>
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
            <span className="text-xs font-medium text-[#5B6470]">Resume Score</span>
          </div>
          {reduced ? (
            <div className="flex-1 space-y-0.5">
              {renderChecklist()}
            </div>
          ) : (
            <motion.div
              className="flex-1 space-y-0.5"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-80px", amount: 0.2 }}
            >
              {checkItems.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeItem}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon status={item.status} />
                    <span className="text-xs text-[#5B6470] truncate">{item.label}</span>
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
  const reduced = useReducedMotion();
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
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <a href="/" className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-[#2DC08D] flex items-center justify-center">
                  <span className="text-sm font-black text-white">H</span>
                </div>
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
                      <div className="absolute top-full mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-2 z-50">
                        <a href="/compare" className="block px-4 py-2 text-sm text-[#5B6470] hover:bg-[#FAFAFA]">Resume Enhancer</a>
                        <a href="/suggestions" className="block px-4 py-2 text-sm text-[#5B6470] hover:bg-[#FAFAFA]">AI Agents</a>
                        <a href="/history" className="block px-4 py-2 text-sm text-[#5B6470] hover:bg-[#FAFAFA]">History</a>
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
                  onClick={() => navigate(user ? "/upload" : "/login")}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate(user ? "/upload" : "/login")}
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
                className="md:hidden pb-4 border-t border-[#E5E7EB] pt-4 space-y-3"
              >
                <a href="/" className="block text-sm font-medium text-[#5B6470]">Resume Checker</a>
                <a href="/compare" className="block text-sm font-medium text-[#5B6470]">Resume Enhancer</a>
                <a href="/suggestions" className="block text-sm font-medium text-[#5B6470]">AI Agents</a>
                <a href="/dashboard" className="block text-sm font-medium text-[#5B6470]">For Organizations</a>
                <a href="/pricing" className="block text-sm font-medium text-[#5B6470]">Pricing</a>
              </motion.div>
            )}
        </div>
      </header>

      <section className="py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-1.5 bg-[#2DC08D]/10 text-[#2DC08D] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#2DC08D]/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#2DC08D]" />
              AI-POWERED RESUME ANALYSIS
            </div>
          </FadeIn>

          <FadeIn delay={0.1} y={20}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-[#0F1115] leading-[1.05]">
              Your resume,{" "}
              <span className="text-[#2DC08D] italic font-black">decoded.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2} y={20}>
            <p className="text-base sm:text-lg text-[#5B6470] max-w-xl mx-auto mt-4 leading-relaxed">
              Get instant AI feedback, ATS scoring, and a personal career coach to help you land more interviews.
            </p>
          </FadeIn>

          {user ? (
            <FadeIn delay={0.3} y={20}>
              <div className="mt-8 max-w-md mx-auto">
                <div
                  id="upload-zone"
                  className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-150 ${
                    dragActive ? "border-[#2DC08D] bg-[#2DC08D]/5 shadow-lg shadow-[#2DC08D]/5" : "border-[#E5E7EB] hover:border-[#2DC08D]/50 hover:shadow-md"
                  }`}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <motion.div
                      className="p-3 bg-[#2DC08D]/10 rounded-full"
                      animate={reduced ? {} : { y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <UploadCloud className="w-7 h-7 text-[#2DC08D]" />
                    </motion.div>

                    {!file ? (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-[#0F1115]">Drop your resume here</p>
                          <p className="text-xs text-[#9AA3AF] mt-0.5">or click to browse files</p>
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
                        <p className="text-[10px] text-[#9AA3AF]">PDF · DOCX · Max 2MB</p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-2.5 bg-green-50 rounded-full border border-green-100">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F1115] flex items-center gap-2">
                            {file.name}
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </p>
                          <p className="text-xs text-[#9AA3AF] mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setFile(null)}>Remove</Button>
                          <Button size="sm" onClick={handleAnalyze} disabled={uploading}>
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            {uploading ? "Analyzing..." : "Analyze"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg mt-4"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.3} y={20}>
              <div className="mt-8 max-w-sm mx-auto">
                <div className="border-2 border-[#E5E7EB] rounded-2xl p-8 text-center hover:border-[#2DC08D]/50 hover:shadow-md transition-all duration-200">
                  <div className="p-3 bg-[#2DC08D]/10 rounded-full mx-auto w-fit mb-4">
                    <UploadCloud className="w-7 h-7 text-[#2DC08D]" />
                  </div>
                  <p className="text-sm font-semibold text-[#0F1115]">Sign in to analyze your resume</p>
                  <p className="text-xs text-[#9AA3AF] mt-1 mb-4">Get instant AI feedback and ATS scoring</p>
                  <Button onClick={() => navigate("/login")}>
                    Sign In Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.5} y={20}>
            <div className="mt-8">
              <ProductMockup />
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="border-t border-[#E5E7EB]" />
      </div>

      <section className="py-12 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <FadeIn>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F1115]">How it works</h2>
              <p className="text-sm text-[#5B6470] mt-1">Three simple steps to a better resume</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { step: "01", title: "Upload", desc: "Drop your resume in PDF or DOCX format. We support any layout." },
              { step: "02", title: "AI Analysis", desc: "Our AI parses your resume against 9 ATS criteria in seconds." },
              { step: "03", title: "Get Feedback", desc: "Receive a detailed score report with actionable improvement tips." },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.12} y={20}>
                <div className="text-center p-5 rounded-xl border border-[#E5E7EB] bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-[#2DC08D]/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-sm font-bold text-[#2DC08D]">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-[#0F1115] text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#5B6470] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <FadeIn>
            <p className="text-[10px] text-[#9AA3AF] uppercase tracking-widest text-center mb-4">
              Trusted by job seekers at
            </p>
          </FadeIn>
          <FadeIn>
            <MarqueeRow items={["Google", "Meta", "Amazon", "Microsoft", "Stripe"]} />
          </FadeIn>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="border-t border-[#E5E7EB]" />
      </div>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <FadeIn>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F1115]">Everything you need</h2>
              <p className="text-sm text-[#5B6470] mt-1">AI-powered tools to land more interviews</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: BarChart3, title: "ATS Score", desc: "Pass filters with optimized resumes that match what recruiters look for." },
              { icon: Search, title: "Gap Analysis", desc: "Discover missing keywords and skills to make your resume stand out." },
              { icon: MessageSquare, title: "AI Coach", desc: "Ask anything about your resume and get instant, actionable advice." },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1} y={16}>
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
                  <div className="w-9 h-9 rounded-full bg-[#2DC08D]/10 flex items-center justify-center mb-3">
                    <item.icon className="w-4.5 h-4.5 text-[#2DC08D]" />
                  </div>
                  <h3 className="font-semibold text-[#0F1115] text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#5B6470] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-[#FAFAFA] border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 text-center">
          <FadeIn y={16}>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F1115]">Ready to optimize your resume?</h2>
            <p className="text-sm text-[#5B6470] mt-1 mb-5">Join thousands of job seekers who landed more interviews with HireLens.</p>
            <Button
              size="lg"
              onClick={() => navigate(user ? "/upload" : "/login")}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB] py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-0">
                <span className="text-sm font-bold text-[#0F1115]">Hire</span>
                <span className="text-sm font-bold text-[#2DC08D]">Lens</span>
              </div>
              <div className="hidden sm:flex items-center gap-5 text-xs text-[#9AA3AF]">
                <a href="/" className="hover:text-[#5B6470] transition-colors">Privacy</a>
                <a href="/" className="hover:text-[#5B6470] transition-colors">Terms</a>
                <a href="/" className="hover:text-[#5B6470] transition-colors">Contact</a>
              </div>
            </div>
            <p className="text-xs text-[#9AA3AF]">&copy; 2026 HireLens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
