interface LogData {
  method: string;
  path: string;
  userId?: string;
  latencyMs?: number;
  status: "success" | "error";
  error?: string;
  stackTrace?: string;
}

export function logApiCall(data: LogData) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...data,
  };

  console.log(JSON.stringify(logEntry));
}

export function logError(error: Error, context?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "error",
    message: error.message,
    stack: error.stack,
    context,
  };

  console.error(JSON.stringify(logEntry));
}
