import type { NextFunction, Request, Response } from 'express';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected server error';
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const message = getErrorMessage(error);
  const firestoreUnavailable =
    message.includes('Firebase') ||
    message.includes('Missing Firebase') ||
    message.includes('service account') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('Cloud Firestore API has not been used');

  if (firestoreUnavailable) {
    res.status(503).json({
      error: 'Database unavailable',
      details: message,
    });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error', details: message });
}
