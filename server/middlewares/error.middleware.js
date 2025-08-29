import { ZodError } from "zod";

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429);
  }
}

// Async handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString()
  });

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message).join(", ");
    error = new ValidationError(message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = new ConflictError(message);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    const message = "Invalid resource identifier";
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AuthenticationError("Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    error = new AuthenticationError("Token expired");
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
    error = new ValidationError(message, err.errors);
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new ValidationError("File too large");
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    error = new ValidationError("Too many files");
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error = new ValidationError("Unexpected file field");
  }

  // Rate limit errors
  if (err.status === 429) {
    error = new RateLimitError();
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(isDevelopment && { stack: err.stack }),
      ...(error.errors && { errors: error.errors }),
      ...(error.code && { code: error.code })
    },
    ...(isDevelopment && { 
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    })
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Global error handler for unhandled rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("Unhandled Rejection:", err);
  console.error("Promise:", promise);
  
  // Close server gracefully
  process.exit(1);
});

// Global error handler for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  
  // Close server gracefully
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
