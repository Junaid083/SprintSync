import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Task from "@/lib/models/Task";
import { getAuthUserFromRequest } from "@/lib/auth";
import { logApiCall } from "@/lib/logger";
import { createErrorResponse } from "@/lib/errorHandler";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const user = getAuthUserFromRequest(request);
  const { id } = await params;

  try {
    if (!user) {
      logApiCall({
        method: "GET",
        path: `/api/tasks/${id}`,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      });

      return NextResponse.json(
        { success: false, error: "Please log in to access tasks" },
        { status: 401 }
      );
    }

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID provided" },
        { status: 400 }
      );
    }

    await connectDB();

    // Admin can access any task, regular users only their own
    const query = user.isAdmin
      ? { _id: id, isDeleted: false }
      : { _id: id, userId: user.userId, isDeleted: false };

    const task = await Task.findOne(query).populate("userId", "email");

    if (!task) {
      logApiCall({
        method: "GET",
        path: `/api/tasks/${id}`,
        userId: user.userId,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Task not found",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Task not found or you don't have permission to view it",
        },
        { status: 404 }
      );
    }

    logApiCall({
      method: "GET",
      path: `/api/tasks/${id}`,
      userId: user.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    logApiCall({
      method: "GET",
      path: `/api/tasks/${id}`,
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const user = getAuthUserFromRequest(request);
  const { id } = await params;

  try {
    if (!user) {
      logApiCall({
        method: "PUT",
        path: `/api/tasks/${id}`,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      });

      return NextResponse.json(
        { success: false, error: "Please log in to update tasks" },
        { status: 401 }
      );
    }

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID provided" },
        { status: 400 }
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

    if (!["todo", "in_progress", "done"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid task status" },
        { status: 400 }
      );
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return NextResponse.json(
        { success: false, error: "Invalid task priority" },
        { status: 400 }
      );
    }

    await connectDB();

    // Build update object
    const updateData: any = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      totalMinutes: totalMinutes || 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    // Admin can reassign tasks
    if (user.isAdmin && assignedUserId) {
      updateData.userId = assignedUserId;
    }

    // Admin can edit any task, regular users can only edit their own
    const query = user.isAdmin
      ? { _id: id, isDeleted: false }
      : { _id: id, userId: user.userId, isDeleted: false };

    const task = await Task.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    }).populate("userId", "email");

    if (!task) {
      logApiCall({
        method: "PUT",
        path: `/api/tasks/${id}`,
        userId: user.userId,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Task not found",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Task not found or you don't have permission to edit it",
        },
        { status: 404 }
      );
    }

    logApiCall({
      method: "PUT",
      path: `/api/tasks/${id}`,
      userId: user.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error: any) {
    logApiCall({
      method: "PUT",
      path: `/api/tasks/${id}`,
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const user = getAuthUserFromRequest(request);
  const { id } = await params;

  try {
    if (!user) {
      logApiCall({
        method: "DELETE",
        path: `/api/tasks/${id}`,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      });

      return NextResponse.json(
        { success: false, error: "Please log in to delete tasks" },
        { status: 401 }
      );
    }

    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID provided" },
        { status: 400 }
      );
    }

    await connectDB();

    // Admin can delete any task, regular users only their own
    const query = user.isAdmin
      ? { _id: id, isDeleted: false }
      : { _id: id, userId: user.userId, isDeleted: false };

    const task = await Task.findOneAndUpdate(
      query,
      { isDeleted: true },
      { new: true }
    );

    if (!task) {
      logApiCall({
        method: "DELETE",
        path: `/api/tasks/${id}`,
        userId: user.userId,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Task not found",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Task not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    logApiCall({
      method: "DELETE",
      path: `/api/tasks/${id}`,
      userId: user.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error: any) {
    logApiCall({
      method: "DELETE",
      path: `/api/tasks/${id}`,
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
