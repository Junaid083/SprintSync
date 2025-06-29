import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? "" : "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = "An unexpected error occurred. Please try again.";

    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.status === 401) {
      errorMessage = "Your session has expired. Please log in again.";
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } else if (error.response?.status === 403) {
      errorMessage = "You don't have permission to perform this action.";
    } else if (error.response?.status === 404) {
      errorMessage = "The requested resource was not found.";
    } else if (error.response?.status >= 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (
      error.code === "NETWORK_ERROR" ||
      error.code === "ECONNABORTED"
    ) {
      errorMessage =
        "Network error. Please check your connection and try again.";
    }

    const userFriendlyError = new Error(errorMessage);
    userFriendlyError.name = "UserFriendlyError";

    return Promise.reject(userFriendlyError);
  }
);

export default axiosInstance;
