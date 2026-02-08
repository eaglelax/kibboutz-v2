import jwt from 'jsonwebtoken';
import { Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};
