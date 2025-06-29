import axiosInstance from "./axiosInstance";
import type { User } from "@/lib/types";

export const userService = {
  async getList(): Promise<User[]> {
    const response = await axiosInstance.get("/api/users");
    return response.data.data;
  },
};
