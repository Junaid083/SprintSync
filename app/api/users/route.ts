import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { getAuthUserFromRequest } from "@/lib/auth";
import { logApiCall } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const user = getAuthUserFromRequest(request);

  try {
    if (!user) {
      logApiCall({
        method: "GET",
        path: "/api/users",
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      });

      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const users = await User.find({ isDeleted: false, isActive: true })
      .select("_id email isAdmin")
      .sort({ email: 1 })
      .lean();

    logApiCall({
      method: "GET",
      path: "/api/users",
      userId: user.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    logApiCall({
      method: "GET",
      path: "/api/users",
      userId: user?.userId,
      latencyMs: Date.now() - startTime,
      status: "error",
      error: error.message,
      stackTrace: error.stack,
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
