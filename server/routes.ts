import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  handleValidationErrors, 
  validateUserData, 
  validateOrder, 
  validateId,
  validateSearchQuery 
} from "./middleware/validation";
import { 
  authenticateFirebaseToken, 
  requireRole, 
  authenticateApiKey, 
  optionalAuth 
} from "./middleware/auth";
import { getSecurityEvents, getRequestMetrics } from "./middleware/monitoring";

export async function registerRoutes(app: Express): Promise<Server> {
  // 🔒 SECURE API ROUTES with validation

  // Health check endpoint (no auth required)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Example user endpoint with validation
  app.post('/api/users', 
    validateUserData(),
    handleValidationErrors,
    async (req: Request, res: Response) => {
      try {
        const user = await storage.createUser(req.body);
        res.status(201).json({ success: true, user });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  );

  // Get user by ID with validation
  app.get('/api/users/:id',
    validateId('id'),
    handleValidationErrors,
    async (req: Request, res: Response) => {
      try {
        const user = await storage.getUser(parseInt(req.params.id));
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, user });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
      }
    }
  );

  // Search endpoint with query validation
  app.get('/api/search',
    validateSearchQuery(),
    handleValidationErrors,
    (req: Request, res: Response) => {
      const { q, limit = 10, offset = 0 } = req.query;
      res.json({
        success: true,
        query: q,
        results: [],
        pagination: { limit, offset }
      });
    }
  );

  // Example order endpoint (would integrate with Firebase in real use)
  app.post('/api/orders',
    validateOrder(),
    handleValidationErrors,
    (req: Request, res: Response) => {
      // This would normally create an order in Firebase
      res.status(201).json({
        success: true,
        message: 'Order validation passed',
        order_id: `order_${Date.now()}`
      });
    }
  );

  // 🔐 SECURED ENDPOINTS WITH AUTHENTICATION
  
  // Protected user profile endpoint
  app.get('/api/profile',
    authenticateFirebaseToken,
    (req: Request, res: Response) => {
      res.json({
        success: true,
        user: req.user,
        message: 'Profile data retrieved successfully'
      });
    }
  );

  // Admin-only security monitoring endpoints
  app.get('/api/admin/security/events',
    authenticateFirebaseToken,
    requireRole(['admin']),
    getSecurityEvents
  );

  app.get('/api/admin/security/metrics',
    authenticateFirebaseToken,
    requireRole(['admin']),
    getRequestMetrics
  );

  // Server-to-server endpoint (API key authentication)
  app.post('/api/internal/webhook',
    authenticateApiKey,
    (req: Request, res: Response) => {
      res.json({
        success: true,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString()
      });
    }
  );

  // Public endpoint with optional authentication (personalized if logged in)
  app.get('/api/products',
    optionalAuth,
    validateSearchQuery(),
    handleValidationErrors,
    (req: Request, res: Response) => {
      const { q, limit = 10, offset = 0 } = req.query;
      const isAuthenticated = !!req.user;
      
      res.json({
        success: true,
        products: [], // Would fetch from database
        personalized: isAuthenticated,
        user_id: req.user?.uid || null,
        pagination: { limit, offset, query: q }
      });
    }
  );

  // API versioning example
  app.get('/api/v1/status', (req: Request, res: Response) => {
    res.json({
      version: '1.0.0',
      status: 'operational',
      features: ['authentication', 'rate-limiting', 'validation', 'monitoring'],
      security_level: 'high',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      error: true,
      status: 404,
      message: `API endpoint ${req.path} not found`,
      suggestion: 'Check API documentation for available endpoints'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
