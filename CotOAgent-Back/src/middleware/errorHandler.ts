import type { Request, Response, NextFunction } from 'express';

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

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
    ...(process.env.NODE_ENV === 'development' && { stack: err instanceof Error ? err.stack : undefined }),
  });
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const validateRequest = (value: unknown, message: string, statusCode: number = 400): void => {
  if (!value) {
    throw new AppError(statusCode, message);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notFoundHandler = (req: Request, _res: Response) => {
  throw new AppError(404, `Route ${req.originalUrl} not found`, true);
};
