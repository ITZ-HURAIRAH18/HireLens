import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1", // change if needed
});

export const uploadAndAnalyzeResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/resume/upload-and-analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const chatWithResume = (sessionId, message) => {
  return API.post("/resume/chat/", {
    session_id: sessionId,
    message: message,
  });
};
