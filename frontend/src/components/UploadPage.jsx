import { useState, useCallback } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export default function UploadPage({ onFileAnalyzed }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(selectedFile.type)) { setError("Please upload a PDF or DOCX file."); return false; }
    if (selectedFile.size > 5 * 1024 * 1024) { setError("File size must be under 5MB."); return false; }
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (validateFile(f)) setFile(f);
    }
  }, []);

  const handleChange = (e) => {
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
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Resume</h1>
        <p className="mt-1.5 text-sm text-slate-500">PDF or DOCX supported &mdash; AI will analyze ATS compatibility and overall strength.</p>
      </div>
      <div
        className={`relative group flex flex-col items-center justify-center py-14 px-6 border-2 border-dashed rounded-xl transition-colors duration-200 cursor-pointer ${
          dragActive ? "border-[#2DC08D] bg-emerald-50" : file ? "border-green-200 bg-green-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
        }`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} accept=".pdf,.docx" />
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center space-y-3 pointer-events-none">
              <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-200">
                <UploadCloud className="w-7 h-7 text-[#2DC08D]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Click to upload <span className="font-normal text-slate-400">or drag and drop</span></p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX &bull; Max 5MB</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-3 z-10">
              <div className="p-3 bg-white rounded-full shadow-sm border border-green-100"><FileText className="w-7 h-7 text-green-600" /></div>
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center justify-center gap-2">{file.name}<CheckCircle2 className="w-4 h-4 text-green-500" /></p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setFile(null)} className="relative z-20">Remove</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg"><AlertCircle className="w-4 h-4 shrink-0" /><p>{error}</p></motion.div>}
      <div className="flex justify-center sm:justify-end">
        <Button disabled={!file || uploading} onClick={handleAnalyze} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-200 text-base py-3 px-6 gap-2" size="lg">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {uploading ? "Analyzing..." : "Analyze Resume"}
        </Button>
      </div>
    </div>
  );
}
