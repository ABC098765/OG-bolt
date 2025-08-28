import { Request, Response, NextFunction } from 'express';
// Firebase Admin imports (would be used in production)
// import { getAuth } from 'firebase-admin/auth';

// 🔐 API AUTHENTICATION MIDDLEWARE

// Interface for authenticated requests
// Use the extended Express.Request interface

// Firebase Admin Auth middleware
export const authenticateFirebaseToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        status: 401,
        message: 'Authentication required - Please provide a valid token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For development, we'll simulate token validation
    // In production, you'd initialize Firebase Admin SDK
    if (process.env.NODE_ENV === 'development') {
      // Simulate token validation for development
      if (token === 'dev-token') {
        req.user = {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          role: 'user'
        };
        return next();
      } else {
        return res.status(401).json({
          error: true,
          status: 401,
          message: 'Invalid authentication token'
        });
      }
    }

    // Production Firebase token verification would go here
    // const decodedToken = await getAuth().verifyIdToken(token);
    // req.user = {
    //   uid: decodedToken.uid,
    //   email: decodedToken.email,
    //   phone: decodedToken.phone_number,
    //   role: decodedToken.role || 'user'
    // };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: true,
      status: 401,
      message: 'Invalid or expired authentication token'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        status: 401,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'user';
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: true,
        status: 403,
        message: 'Insufficient permissions for this operation'
      });
    }

    next();
  };
};

// API key authentication for server-to-server communication
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({
      error: true,
      status: 401,
      message: 'API key required'
    });
  }

  // In production, store API keys securely (hashed)
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || ['dev-api-key-123'];
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: true,
      status: 401,
      message: 'Invalid API key'
    });
  }

  next();
};

// Optional authentication (for endpoints that work with or without auth)
export const optionalAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without authentication
  }

  try {
    const token = authHeader.substring(7);
    
    // Simplified for development
    if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
      req.user = {
        uid: 'dev-user-123',
        email: 'dev@example.com',
        role: 'user'
      };
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};