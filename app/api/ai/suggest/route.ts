import { type NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth";
import { logApiCall } from "@/lib/logger";
import { createErrorResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const user = getAuthUserFromRequest(request);

  try {
    if (!user) {
      logApiCall({
        method: "POST",
        path: "/api/ai/suggest",
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Unauthorized",
      });

      return NextResponse.json(
        { success: false, error: "Please log in to use AI suggestions" },
        { status: 401 }
      );
    }

    const { input } = await request.json();

    if (!input || input.trim().length === 0) {
      logApiCall({
        method: "POST",
        path: "/api/ai/suggest",
        userId: user.userId,
        latencyMs: Date.now() - startTime,
        status: "error",
        error: "Missing input",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Please provide a task title for AI suggestions",
        },
        { status: 400 }
      );
    }

    if (input.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: "Input text is too long. Please keep it under 200 characters.",
        },
        { status: 400 }
      );
    }

    let suggestion;

    // Try OpenAI API if available
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant that creates detailed task descriptions and implementation plans for software engineering tasks. Be specific and actionable.",
                },
                {
                  role: "user",
                  content: `Create a detailed task description and implementation plan for: "${input}"`,
                },
              ],
              max_tokens: 500,
              temperature: 0.7,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          suggestion = {
            description:
              data.choices[0]?.message?.content || "No suggestion available",
          };
        } else if (response.status === 401) {
          throw new Error("Invalid OpenAI API key");
        } else if (response.status === 429) {
          throw new Error("OpenAI API rate limit exceeded");
        } else {
          throw new Error("OpenAI API request failed");
        }
      } catch (openaiError: any) {
        console.error("OpenAI API error:", openaiError);

        if (openaiError.message.includes("rate limit")) {
          return NextResponse.json(
            {
              success: false,
              error:
                "AI service is currently busy. Please try again in a few minutes.",
            },
            { status: 429 }
          );
        }

        // Fall back to deterministic response
        suggestion = generateFallbackSuggestion(input);
      }
    } else {
      // Use fallback suggestion when no API key is configured
      suggestion = generateFallbackSuggestion(input);
    }

    logApiCall({
      method: "POST",
      path: "/api/ai/suggest",
      userId: user.userId,
      latencyMs: Date.now() - startTime,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: suggestion,
      message: "AI suggestion generated successfully",
    });
  } catch (error: any) {
    logApiCall({
      method: "POST",
      path: "/api/ai/suggest",
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

function generateFallbackSuggestion(input: string) {
  const suggestions = {
    description: `Detailed implementation plan for: ${input}

**Objective:**
Complete the task "${input}" with high quality and attention to detail.

**Implementation Steps:**
1. **Research & Planning**
   - Analyze requirements and constraints
   - Identify dependencies and prerequisites
   - Create technical specification

2. **Development Phase**
   - Set up development environment
   - Implement core functionality
   - Write comprehensive tests

3. **Quality Assurance**
   - Code review and refactoring
   - Performance optimization
   - Security considerations

4. **Documentation & Deployment**
   - Update documentation
   - Prepare deployment strategy
   - Monitor and validate results

**Acceptance Criteria:**
- All functionality works as expected
- Code follows best practices
- Tests pass with good coverage
- Documentation is complete

**Estimated Time:** 2-4 hours depending on complexity`,
  };

  return suggestions;
}
