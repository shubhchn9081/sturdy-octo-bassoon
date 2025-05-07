import { Request, Response, NextFunction } from 'express';

// Middleware to check if user is authenticated
export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};