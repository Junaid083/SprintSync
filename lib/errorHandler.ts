export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  validationErrors?: ValidationError[];
  statusCode: number;
}

export function parseMongooseError(error: any): ApiError {
  if (error.name === "ValidationError") {
    const validationErrors: ValidationError[] = [];
    let message = "Please fix the following errors:";

    for (const field in error.errors) {
      const fieldError = error.errors[field];
      validationErrors.push({
        field,
        message: fieldError.message,
      });
    }

    // Create a user-friendly message
    if (validationErrors.length === 1) {
      message = validationErrors[0].message;
    } else {
      message = validationErrors.map((err) => err.message).join(", ");
    }

    return {
      message,
      validationErrors,
      statusCode: 400,
    };
  }

  if (error.name === "CastError") {
    return {
      message: "Invalid ID format provided",
      statusCode: 400,
    };
  }

  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyPattern)[0];
    return {
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`,
      statusCode: 409,
    };
  }

  if (error.name === "JsonWebTokenError") {
    return {
      message: "Invalid authentication token",
      statusCode: 401,
    };
  }

  if (error.name === "TokenExpiredError") {
    return {
      message: "Authentication token has expired",
      statusCode: 401,
    };
  }

  // Default error
  return {
    message: "An unexpected error occurred. Please try again.",
    statusCode: 500,
  };
}

export function createErrorResponse(error: any) {
  const apiError = parseMongooseError(error);
  return {
    success: false,
    error: apiError.message,
    validationErrors: apiError.validationErrors,
    statusCode: apiError.statusCode,
  };
}
