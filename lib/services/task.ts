import axiosInstance from "./axiosInstance";
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  ApiResponse,
} from "@/lib/types";

export const taskService = {
  async getList(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    search?: string;
    userId?: string;
  }): Promise<{ tasks: Task[]; pagination: any }> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.priority) searchParams.append("priority", params.priority);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.userId) searchParams.append("userId", params.userId);

    const response = await axiosInstance.get(
      `/api/tasks?${searchParams.toString()}`
    );
    return response.data.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await axiosInstance.get(`/api/tasks/${id}`);
    return response.data.data;
  },

  async create(
    data: CreateTaskData & { assignedUserId?: string }
  ): Promise<Task> {
    const response = await axiosInstance.post("/api/tasks", data);
    return response.data.data;
  },

  async update(
    id: string,
    data: UpdateTaskData & { assignedUserId?: string }
  ): Promise<Task> {
    const response = await axiosInstance.put(`/api/tasks/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<ApiResponse> {
    const response = await axiosInstance.delete(`/api/tasks/${id}`);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<Task> {
    const response = await axiosInstance.patch(`/api/tasks/${id}/status`, {
      status,
    });
    return response.data.data;
  },
};
