export interface User {
  _id: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  totalMinutes: number;
  dueDate?: Date;
  userId: string | User; // Can be populated
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  totalMinutes: number;
  dueDate?: Date;
  assignedUserId?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AiSuggestion {
  suggestion?: string;
  description?: string;
  dailyPlan?: string[];
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  overdue?: boolean;
  search?: string;
  userId?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}
