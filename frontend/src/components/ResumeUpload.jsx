import { useState } from 'react';
import { uploadAndAnalyzeResume } from '../api';
import '../ResumeUpload.css';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export default function ResumeUpload({ onSuccess }) {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  /* ---------- helpers ---------- */
  const isValid = (f) => {
    if (!f) return 'No file selected';
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.type))
      return 'Only .pdf or .docx';
    if (f.size > MAX_BYTES) return 'File must be ≤ 2 MB';
    return '';
  };

  /* ---------- handlers ---------- */
  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    const msg = isValid(f);
    if (msg) return setError(msg);
    setError('');
    setFile(f);
  };

  const onInputChange = (e) => {
    const f = e.target.files[0];
    const msg = isValid(f);
    if (msg) return setError(msg);
    setError('');
    setFile(f);
  };

  const handleUpload = async () => {
    const msg = isValid(file);
    if (msg) return setError(msg);

    setLoading(true);
    setError('');
    try {
      const { data } = await uploadAndAnalyzeResume(file);
      onSuccess(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="ru">
      <div
        className={`ru__drop ${error ? 'ru__drop--error' : ''}`}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          id="resume-input"
          type="file"
          accept=".pdf,.docx"
          onChange={onInputChange}
          className="ru__input"
          disabled={loading}
        />
        <label htmlFor="resume-input" className="ru__label">
          {file ? file.name : 'Drop résumé here or click to browse'}
        </label>
      </div>

      {error && <p className="ru__err">{error}</p>}

      <button
        className="ru__btn"
        onClick={handleUpload}
        disabled={loading || !file}
      >
        {loading ? (
          <>
            <span className="ru__spinner" />
            Analysing…
          </>
        ) : (
          'Upload & Analyse'
        )}
      </button>
    </div>
  );
}