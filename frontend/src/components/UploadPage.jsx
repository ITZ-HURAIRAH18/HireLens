import { useState, useCallback } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Resume</h1>
        <p className="mt-2 text-slate-500 text-sm">Upload a resume in PDF or DOCX format to receive an AI-powered analysis of its ATS compatibility and overall strength.</p>
      </div>
      <Card className="overflow-hidden border-slate-200">
        <CardContent className="p-0">
          <div
            className={`relative group flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed transition-colors duration-200 ${
              dragActive ? "border-[#d97757] bg-orange-50" : file ? "border-green-200 bg-green-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
            } rounded-xl m-6`}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input type="file" id="file-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} accept=".pdf,.docx" />
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center space-y-4 pointer-events-none">
                  <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-200">
                    <UploadCloud className="w-8 h-8 text-[#d97757]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-700">Click to upload <span className="font-normal text-slate-500">or drag and drop</span></p>
                    <p className="text-sm text-slate-500 mt-1">PDF, DOCX (Max 5MB)</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-4 z-10">
                  <div className="p-4 bg-white rounded-full shadow-sm border border-green-100"><FileText className="w-8 h-8 text-green-600" /></div>
                  <div>
                    <p className="text-base font-medium text-slate-900 flex items-center justify-center gap-2">{file.name}<CheckCircle2 className="w-4 h-4 text-green-500" /></p>
                    <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setFile(null)} className="mt-2 relative z-20">Remove file</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-lg"><AlertCircle className="w-5 h-5" /><p>{error}</p></motion.div>}
      <div className="flex justify-end">
        <Button size="lg" disabled={!file || uploading} onClick={handleAnalyze} className="shadow-sm">
          {uploading ? "Analyzing..." : "Analyze Resume"}
        </Button>
      </div>
    </div>
  );
}
