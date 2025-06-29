import axiosInstance from "./axiosInstance";
import type { User, ApiResponse } from "@/lib/types";

export const authService = {
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User }>> {
    const response = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async logout(): Promise<ApiResponse> {
    const response = await axiosInstance.post("/api/auth/logout");
    return response.data;
  },

  async me(): Promise<User> {
    const response = await axiosInstance.get("/api/auth/me");
    return response.data.data;
  },
};
