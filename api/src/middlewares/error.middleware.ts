import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Erreur de validation',
      details: err.message,
    });
    return;
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Token invalide',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expiré',
    });
    return;
  }

  // Erreur serveur par défaut
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Erreur interne du serveur',
  });
};

// Handler pour les routes non trouvées
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} non trouvée`,
  });
};
