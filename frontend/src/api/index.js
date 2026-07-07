import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export const uploadAndAnalyzeResume = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return API.post("/resume/upload-and-analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const chatWithResume = (sessionId, message) => {
  return API.post("/resume/chat/", { session_id: sessionId, message: message });
};

export const invokeAgent = (payload) => {
  return API.post("/agent/invoke", payload);
};

export const getDashboard = () => {
  return API.get("/dashboard");
};

export const getHistory = () => {
  return API.get("/history");
};

export const authApi = {
  signup: (data) => API.post("/auth/signup", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
};

export const exportApi = {
  resume: (data) => API.post("/export/resume", data, { responseType: "blob" }),
  coverLetter: (data) => API.post("/export/cover-letter", data, { responseType: "blob" }),
  report: (data) => API.post("/export/report", data, { responseType: "blob" }),
};

export default API;
