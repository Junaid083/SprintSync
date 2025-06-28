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
};
