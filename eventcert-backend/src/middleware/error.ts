import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  console.error(`[ERROR] ${err.message}`);
  res.status(statusCode).json({
    error: err.message || "Internal server error",
  });
}
