import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";
import { logApiCall } from "@/lib/logger";
import { createErrorResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      logApiCall({
        method: "POST",
        path: "/api/auth/login",
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Missing email or password",
      });

      return NextResponse.json(
        { success: false, error: "Please provide both email and password" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
      isDeleted: false,
    });

    if (!user) {
      logApiCall({
        method: "POST",
        path: "/api/auth/login",
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "User not found",
      });

      return NextResponse.json(
        { success: false, error: "No account found with this email address" },
        { status: 404 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logApiCall({
        method: "POST",
        path: "/api/auth/login",
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Invalid password",
      });

      return NextResponse.json(
        { success: false, error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    });

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    logApiCall({
      method: "POST",
      path: "/api/auth/login",
      userId: user._id.toString(),
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      },
      message: "Login successful",
    });
  } catch (error: any) {
    logApiCall({
      method: "POST",
      path: "/api/auth/login",
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
