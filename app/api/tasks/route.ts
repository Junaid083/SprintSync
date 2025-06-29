import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/lib/models/Task";
import { getAuthUserFromRequest } from "@/lib/auth";
import { logApiCall } from "@/lib/logger";
import { createErrorResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const user = getAuthUserFromRequest(request);

  try {
    if (!user) {
      logApiCall({
        method: "GET",
        path: "/api/tasks",
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      });

      return NextResponse.json(
        { success: false, error: "Please log in to access tasks" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;

    // Build query - admin sees all tasks, regular users see only their own
    const query: any = { isDeleted: false };

    if (!user.isAdmin) {
      query.userId = user.userId;
    } else if (userId && userId !== "all") {
      query.userId = userId;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [tasks, totalTasks] = await Promise.all([
      Task.find(query)
        .populate("userId", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalTasks / limit);

    logApiCall({
      method: "GET",
      path: "/api/tasks",
      userId: user.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages,
          totalTasks,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    logApiCall({
      method: "GET",
      path: "/api/tasks",
      userId: user?.userId,
      latencyMs: Date.now() - startTime,
      status: "error",
      error: error.message,
      stackTrace: error.stack,
    });

    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const user = getAuthUserFromRequest(request);

  try {
    if (!user) {
      logApiCall({
        method: "POST",
        path: "/api/tasks",
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      });

      return NextResponse.json(
        { success: false, error: "Please log in to create tasks" },
        { status: 401 }
      );
    }

    const {
      title,
      description,
      status,
      priority,
      totalMinutes,
      dueDate,
      assignedUserId,
    } = await request.json();

    // Manual validation for better error messages
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Task title is required" },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Task description is required" },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { success: false, error: "Task title cannot exceed 200 characters" },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: "Task description cannot exceed 2000 characters",
        },
        { status: 400 }
      );
    }

    if (totalMinutes && totalMinutes < 0) {
      return NextResponse.json(
        { success: false, error: "Time cannot be negative" },
        { status: 400 }
      );
    }

    if (dueDate && new Date(dueDate) <= new Date()) {
      return NextResponse.json(
        { success: false, error: "Due date must be in the future" },
        { status: 400 }
      );
    }

    await connectDB();

    // Determine who the task should be assigned to
    let taskUserId = user.userId; // Default to current user

    if (user.isAdmin && assignedUserId) {
      // Admin can assign to anyone
      taskUserId = assignedUserId;
    }

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      status: status || "todo",
      priority: priority || "medium",
      totalMinutes: totalMinutes || 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId: taskUserId,
    });

    await task.save();

    // Populate user info for response
    await task.populate("userId", "email");

    logApiCall({
      method: "POST",
      path: "/api/tasks",
      userId: user.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json(
      {
        success: true,
        data: task,
        message: "Task created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    logApiCall({
      method: "POST",
      path: "/api/tasks",
      userId: user?.userId,
      latencyMs: Date.now() - startTime,
      status: "error",
      error: error.message,
      stackTrace: error.stack,
    });

    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, {
      status: errorResponse.statusCode,
    });
  }
}
