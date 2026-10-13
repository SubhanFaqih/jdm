import type { Request, Response } from 'express';

// Liveness only: this endpoint does not check database connectivity.
export function getHealth(_req: Request, res: Response) {
  res.status(200).json({ success: true, data: { status: 'ok' } });
}
