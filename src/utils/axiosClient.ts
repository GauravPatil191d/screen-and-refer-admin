import axios from "axios";

// Unified Axios client for Screen & Refer
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true, // Sends and receives HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error extraction
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message extraction
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected server error occurred";

    const customError = new Error(message);
    (customError as any).status = error.response?.status;
    (customError as any).data = error.response?.data;

    return Promise.reject(customError);
  }
);

export default axiosClient;