import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hexagon } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../lib/auth";

export default function Auth({ mode = "login" }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, fullName);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-white flex fade-up">
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-slate-900 text-white p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d97757]/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="z-10 max-w-md w-full">
          <div className="flex items-center mb-12">
            <Hexagon className="w-10 h-10 text-[#d97757]" />
            <span className="ml-3 text-2xl font-bold tracking-tight">HireLens</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-6 leading-tight">Elevate your career with AI-driven insights.</h2>
          <p className="text-lg text-slate-400 mb-12">Join thousands of professionals using HireLens to optimize their resumes for Applicant Tracking Systems and land their dream roles.</p>
          <div className="space-y-4 text-sm font-medium text-slate-300">
            <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-[#d97757]/20 flex items-center justify-center text-[#d97757]">✓</div>Enterprise-grade ATS parsing</div>
            <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-[#d97757]/20 flex items-center justify-center text-[#d97757]">✓</div>Real-time actionable feedback</div>
            <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-[#d97757]/20 flex items-center justify-center text-[#d97757]">✓</div>Context-aware AI career advisor</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden flex items-center mb-8">
            <Hexagon className="w-8 h-8 text-[#d97757]" />
            <span className="ml-2 text-xl font-bold tracking-tight text-slate-900">HireLens</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{isLogin ? "Sign in to your account" : "Create an account"}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "Or " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="font-medium text-[#d97757] hover:text-[#c46445] transition-colors">
              {isLogin ? "start your 14-day free trial" : "Sign in here"}
            </button>
          </p>
          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}
          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#d97757] focus:border-[#d97757] sm:text-sm" />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait..." : isLogin ? "Sign in" : "Create account"}</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
