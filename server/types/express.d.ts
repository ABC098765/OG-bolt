// Extend Express Request interface
declare namespace Express {
  interface Request {
    requestId?: string;
    user?: {
      uid: string;
      email?: string;
      phone?: string;
      role?: string;
    };
  }
}