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
