import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (error.response?.status === 429) {
      // Too Many Requests - не показуємо помилку, React Query обробить retry
      // Можна додати затримку перед наступним запитом
      const retryAfter = error.response.headers["retry-after"];
      if (retryAfter) {
        // Якщо сервер вказав час очікування, чекаємо
        await new Promise((resolve) =>
          setTimeout(resolve, parseInt(retryAfter) * 1000)
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
