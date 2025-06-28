import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthUserFromRequest } from "@/lib/auth";
import { logApiCall } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const user = getAuthUserFromRequest(request);

  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth-token");

    logApiCall({
      method: "POST",
      path: "/api/auth/logout",
      userId: user?.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logApiCall({
      method: "POST",
      path: "/api/auth/logout",
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
