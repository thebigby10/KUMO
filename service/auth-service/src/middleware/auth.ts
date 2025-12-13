import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): void => { 
  
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user as { userId: string; email: string };
    
    next();
  });
};