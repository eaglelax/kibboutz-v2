import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export interface JWTPayload {
  id: string;
  email: string;
  role: Role;
}

// Middleware d'authentification
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token manquant ou invalide',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré',
    });
  }
};

// Middleware de vérification de rôle
export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Accès non autorisé pour ce rôle',
      });
      return;
    }

    next();
  };
};

// Middleware optionnel (authentification si token présent)
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Token invalide, on continue sans user
    next();
  }
};
