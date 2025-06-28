import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUserFromRequest } from "@/lib/auth";
import { logApiCall } from "@/lib/logger";
import { createErrorResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const authUser = getAuthUserFromRequest(request);

  try {
    if (!authUser) {
      logApiCall({
        method: "GET",
        path: "/api/auth/me",
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      });

      return NextResponse.json(
        { success: false, error: "Please log in to access your profile" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      _id: authUser.userId,
      isActive: true,
      isDeleted: false,
    }).select("-passwordHash");

    if (!user) {
      logApiCall({
        method: "GET",
        path: "/api/auth/me",
        userId: authUser.userId,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "User not found",
      });

      return NextResponse.json(
        {
          success: false,
          error: "User account not found or has been deactivated",
        },
        { status: 404 }
      );
    }

    logApiCall({
      method: "GET",
      path: "/api/auth/me",
      userId: authUser.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    logApiCall({
      method: "GET",
      path: "/api/auth/me",
      userId: authUser?.userId,
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
