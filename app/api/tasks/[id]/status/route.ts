import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Task from "@/lib/models/Task"
import { getAuthUserFromRequest } from "@/lib/auth"
import { logApiCall } from "@/lib/logger"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now()
  const user = getAuthUserFromRequest(request)
  const { id } = await params

  try {
    if (!user) {
      logApiCall({
        method: "PATCH",
        path: `/api/tasks/${id}/status`,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      })

      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await request.json()

    if (!["todo", "in_progress", "done"].includes(status)) {
      logApiCall({
        method: "PATCH",
        path: `/api/tasks/${id}/status`,
        userId: user.userId,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Invalid status",
      })

      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    await connectDB()

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { status },
      { new: true, runValidators: true },
    )

    if (!task) {
      logApiCall({
        method: "PATCH",
        path: `/api/tasks/${id}/status`,
        userId: user.userId,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Task not found",
      })

      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    logApiCall({
      method: "PATCH",
      path: `/api/tasks/${id}/status`,
      userId: user.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    })

    return NextResponse.json({
      success: true,
      data: task,
    })
  } catch (error: any) {
    logApiCall({
      method: "PATCH",
      path: `/api/tasks/${id}/status`,
      userId: user?.userId,
      latencyMs: Date.now() - startTime,
      status: "error",
      error: error.message,
      stackTrace: error.stack,
    })

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
