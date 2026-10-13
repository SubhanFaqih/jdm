import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

export const errorMiddleware: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  // Express body-parser errors must not become generic 500 responses.
  if (error instanceof Error && 'type' in error) {
    if (error.type === 'entity.parse.failed') {
      res.status(400).json({ success: false, message: 'Body JSON tidak valid' });
      return;
    }
    if (error.type === 'entity.too.large') {
      res.status(413).json({ success: false, message: 'Body request terlalu besar' });
      return;
    }
  }

  console.error(error);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
};
