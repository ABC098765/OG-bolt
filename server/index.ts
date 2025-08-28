import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { sanitizeInput, requestTimeout } from "./middleware/validation";
import { requestTracker, securityLogger, detectSuspiciousActivity } from "./middleware/monitoring";
import { getSecurityConfig, getSecurityHeaders } from "./config/security";

const app = express();

// Trust proxy for rate limiting behind Netlify/CDN
app.set('trust proxy', 1);

// Load security configuration
const securityConfig = getSecurityConfig();

// Add custom security headers
app.use((req, res, next) => {
  const headers = getSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
});

// 🔒 ENHANCED SECURITY HEADERS - Fine-tuned Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "https://firebasestorage.googleapis.com"],
      scriptSrc: process.env.NODE_ENV === 'development' 
        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google.com", "https://www.gstatic.com", "https://apis.google.com"] // Development mode with reCAPTCHA and Google OAuth
        : ["'self'", "'strict-dynamic'", "https://www.google.com", "https://www.gstatic.com", "https://apis.google.com"], // Production mode with reCAPTCHA and Google OAuth
      connectSrc: [
        "'self'", 
        "https:", 
        "wss:", 
        "ws:",
        "https://identitytoolkit.googleapis.com", // Firebase Auth
        "https://securetoken.googleapis.com", // Firebase Auth  
        "https://firestore.googleapis.com", // Firestore
        "https://fcm.googleapis.com", // Firebase Cloud Messaging
        "https://www.google.com", // reCAPTCHA
        "https://recaptcha.google.com", // reCAPTCHA API
        "https://www.gstatic.com", // reCAPTCHA resources
        "https://accounts.google.com", // Google OAuth
        "https://apis.google.com", // Google APIs
        "https://oauth2.googleapis.com", // Google OAuth token exchange
        "https://content.googleapis.com", // Google OAuth content
        "https://ssl.gstatic.com", // Google static resources
        "*.googleapis.com" // All Google API services
      ],
      frameSrc: [
        "https://accounts.google.com", 
        "https://content.googleapis.com", // Firebase auth frames
        "https://www.google.com", // reCAPTCHA frames
        "https://recaptcha.google.com", // reCAPTCHA frames
        "https://apis.google.com" // Google APIs frames
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"], // Prevent embedding
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Firebase
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: false, // Disabled in favor of CSP
  referrerPolicy: {
    policy: ["strict-origin-when-cross-origin"]
  }
}));

// 🌐 CORS CONFIGURATION - Environment-aware origins
const corsOptions = {
  origin: securityConfig.cors.origins,
  credentials: securityConfig.cors.credentials,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
};
app.use(cors(corsOptions));

// ⚡ RATE LIMITING - Environment-aware limits
const generalLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: `${securityConfig.rateLimit.windowMs / 60000} minutes`
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.apiMax,
  message: {
    error: 'Too many API requests from this IP, please try again later.',
    retryAfter: `${securityConfig.rateLimit.windowMs / 60000} minutes`
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.authMax,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: `${securityConfig.rateLimit.windowMs / 60000} minutes`
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

// 📊 REQUEST TRACKING AND MONITORING
app.use(requestTracker);
app.use(securityLogger);
app.use(detectSuspiciousActivity);

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
