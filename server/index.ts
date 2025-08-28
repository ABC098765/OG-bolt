import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { sanitizeInput, requestTimeout } from "./middleware/validation";

const app = express();

// Trust proxy for rate limiting behind Netlify/CDN
app.set('trust proxy', 1);

// 🔒 SECURITY HEADERS - Protects against XSS, clickjacking, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Vite dev
      connectSrc: ["'self'", "https:", "wss:", "ws:"], // Firebase & Vite HMR
      frameSrc: ["https:"], // Firebase auth
    },
  },
  crossOriginEmbedderPolicy: false, // Required for dev mode
}));

// 🌐 CORS CONFIGURATION - Controls API access
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-netlify-domain.netlify.app', // Replace with your actual Netlify domain
        'https://superfruitcenter.com' // Replace with your custom domain if any
      ]
    : ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// ⚡ RATE LIMITING - Prevents API abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 50, // Stricter limit for API routes
  message: {
    error: 'Too many API requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Very strict limit for auth endpoints
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use(generalLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// 📝 REQUEST PARSING with size limits for security
app.use(express.json({ limit: '10mb' })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// 🧹 SANITIZE INPUT - Prevents XSS attacks
app.use(sanitizeInput);

// ⏰ REQUEST TIMEOUT - Prevents hanging requests
app.use(requestTimeout(30000)); // 30 seconds timeout

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // 🛡️ ENHANCED ERROR HANDLING - Prevents information leakage
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // Log error details for debugging (server-side only)
    log(`ERROR ${req.method} ${req.path} ${status}: ${err.message}`);
    if (status >= 500) {
      console.error('Server Error:', err);
    }

    // Send safe error response to client
    const response: any = {
      error: true,
      status: status
    };

    // Only expose error details in development or for client errors (4xx)
    if (process.env.NODE_ENV === 'development' || status < 500) {
      response.message = err.message || getStatusMessage(status);
    } else {
      // In production, hide server error details
      response.message = 'Internal server error occurred';
    }

    // Add validation errors if present
    if (err.errors && Array.isArray(err.errors)) {
      response.validation_errors = err.errors;
    }

    res.status(status).json(response);
  });
  
  // Helper function for status messages
  function getStatusMessage(status: number): string {
    const messages: { [key: number]: string } = {
      400: 'Bad Request - Invalid data provided',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Access denied',
      404: 'Not Found - Resource not found',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error'
    };
    return messages[status] || `HTTP Error ${status}`;
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
