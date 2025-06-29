import mongoose, { Schema, type Document } from "mongoose";

export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  totalMinutes: number;
  dueDate?: Date;
  userId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    totalMinutes: {
      type: Number,
      default: 0,
      min: [0, "Total minutes cannot be negative"],
    },
    dueDate: {
      type: Date,
      validate: {
        validator: (date: Date) => !date || date > new Date(),
        message: "Due date must be in the future",
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, isDeleted: 1, status: 1 });

TaskSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

TaskSchema.query.byStatus = function (status: string) {
  return this.where({ status, isDeleted: false });
};

TaskSchema.query.byPriority = function (priority: string) {
  return this.where({ priority, isDeleted: false });
};

TaskSchema.query.overdue = function () {
  return this.where({
    dueDate: { $lt: new Date() },
    status: { $ne: "done" },
    isDeleted: false,
  });
};

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
