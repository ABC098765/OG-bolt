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

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: true,
      status: 404,
      message: `API endpoint ${req.path} not found`
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
