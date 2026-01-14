import { useState } from "react";
import { uploadAndAnalyzeResume } from "../api";

const ResumeUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a resume");

    try {
      setLoading(true);
      const res = await uploadAndAnalyzeResume(file);
      onSuccess(res.data);
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-box">
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>
    </div>
  );
};

export default ResumeUpload;
