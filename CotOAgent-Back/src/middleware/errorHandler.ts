import type { Request, Response, NextFunction } from 'express';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler middleware
 * Should be used last in middleware chain
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log error for debugging
  if (!isOperational) {
    console.error('[ERROR] Unhandled Error:', {
      statusCode,
      message,
      stack: err instanceof Error ? err.stack : 'No stack trace',
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.warn('[WARNING] Operational Error:', {
      statusCode,
      message,
      url: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
    ...(process.env.NODE_ENV === 'development' && { stack: err instanceof Error ? err.stack : undefined }),
  });
};

/**
 * Async error handler wrapper for route handlers
 * Wraps async route handlers to catch errors and pass them to the error handler
 * Usage: router.get('/path', asyncHandler(async (req, res, next) => { ... }))
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error helper - throws AppError for validation failures
 */
export const validateRequest = (value: unknown, message: string, statusCode: number = 400): void => {
  if (!value) {
    throw new AppError(statusCode, message);
  }
};

/**
 * Not Found error handler - should be placed after all other routes
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notFoundHandler = (req: Request, _res: Response) => {
  throw new AppError(404, `Route ${req.originalUrl} not found`, true);
};
