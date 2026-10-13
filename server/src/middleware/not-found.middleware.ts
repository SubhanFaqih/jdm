import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';

export const notFoundMiddleware: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'Endpoint tidak ditemukan'));
};
