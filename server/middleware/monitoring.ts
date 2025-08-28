import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// 📊 REQUEST LOGGING AND MONITORING

interface SecurityEvent {
  timestamp: string;
  type: 'auth_failure' | 'rate_limit' | 'validation_error' | 'suspicious_activity' | 'api_access';
  ip: string;
  userAgent: string;
  endpoint: string;
  details: any;
  requestId: string;
}

interface RequestMetrics {
  requestId: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  error?: string;
}

// In-memory storage for development (use proper logging service in production)
const securityEvents: SecurityEvent[] = [];
const requestMetrics: RequestMetrics[] = [];

// Generate unique request ID
export const requestTracker = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Enhanced request logging with security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.requestId || uuidv4();
  
  const requestMetric: RequestMetrics = {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp: new Date().toISOString()
  };

  // Log API access
  if (req.path.startsWith('/api')) {
    logSecurityEvent({
      type: 'api_access',
      ip: requestMetric.ip,
      userAgent: requestMetric.userAgent,
      endpoint: req.path,
      details: {
        method: req.method,
        hasAuth: !!req.headers.authorization,
        contentType: req.get('Content-Type')
      },
      requestId
    });
  }

  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function (body) {
    const duration = Date.now() - startTime;
    requestMetric.duration = duration;
    requestMetric.statusCode = res.statusCode;

    // Log errors
    if (res.statusCode >= 400) {
      requestMetric.error = typeof body === 'object' ? body.message : 'Unknown error';
      
      // Log security events for certain errors
      if (res.statusCode === 401) {
        logSecurityEvent({
          type: 'auth_failure',
          ip: requestMetric.ip,
          userAgent: requestMetric.userAgent,
          endpoint: req.path,
          details: { statusCode: res.statusCode, error: requestMetric.error },
          requestId
        });
      } else if (res.statusCode === 429) {
        logSecurityEvent({
          type: 'rate_limit',
          ip: requestMetric.ip,
          userAgent: requestMetric.userAgent,
          endpoint: req.path,
          details: { statusCode: res.statusCode },
          requestId
        });
      } else if (res.statusCode === 400 && body.validation_errors) {
        logSecurityEvent({
          type: 'validation_error',
          ip: requestMetric.ip,
          userAgent: requestMetric.userAgent,
          endpoint: req.path,
          details: { validationErrors: body.validation_errors },
          requestId
        });
      }
    }

    // Store metrics (in production, send to logging service)
    requestMetrics.push(requestMetric);
    
    // Keep only last 1000 requests in memory
    if (requestMetrics.length > 1000) {
      requestMetrics.shift();
    }

    return originalJson.call(this, body);
  };

  next();
};

// Log security events
export const logSecurityEvent = (event: Omit<SecurityEvent, 'timestamp'>) => {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };
  
  securityEvents.push(securityEvent);
  
  // Keep only last 500 security events in memory
  if (securityEvents.length > 500) {
    securityEvents.shift();
  }

  // In production, send to security monitoring service
  console.log(`🔒 Security Event [${event.type.toUpperCase()}]:`, {
    ip: event.ip,
    endpoint: event.endpoint,
    details: event.details
  });
};

// Suspicious activity detection
export const detectSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  // Check for suspicious patterns in recent requests
  const recentRequests = requestMetrics.filter(
    metric => new Date(metric.timestamp).getTime() > fiveMinutesAgo && metric.ip === ip
  );

  // Detect suspicious patterns
  const suspiciousPatterns = {
    tooManyRequests: recentRequests.length > 50,
    tooManyErrors: recentRequests.filter(r => r.statusCode && r.statusCode >= 400).length > 10,
    sqlInjectionAttempt: req.url.toLowerCase().includes('union') || req.url.toLowerCase().includes('select'),
    xssAttempt: req.url.includes('<script>') || req.url.includes('javascript:'),
    pathTraversal: req.url.includes('../') || req.url.includes('..\\'),
    suspiciousUserAgent: userAgent.toLowerCase().includes('bot') && !userAgent.toLowerCase().includes('googlebot')
  };

  // Log suspicious activity
  Object.entries(suspiciousPatterns).forEach(([pattern, detected]) => {
    if (detected) {
      logSecurityEvent({
        type: 'suspicious_activity',
        ip,
        userAgent,
        endpoint: req.path,
        details: { pattern, url: req.url },
        requestId: req.requestId || 'unknown'
      });
    }
  });

  next();
};

// Security monitoring endpoints
export const getSecurityEvents = (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const events = securityEvents.slice(-limit);
  
  res.json({
    success: true,
    events,
    total: securityEvents.length
  });
};

export const getRequestMetrics = (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const metrics = requestMetrics.slice(-limit);
  
  const summary = {
    totalRequests: requestMetrics.length,
    averageResponseTime: requestMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / requestMetrics.length,
    errorRate: requestMetrics.filter(m => m.statusCode && m.statusCode >= 400).length / requestMetrics.length * 100,
    topEndpoints: getTopEndpoints(),
    topIPs: getTopIPs()
  };
  
  res.json({
    success: true,
    metrics,
    summary
  });
};

// Helper functions
const getTopEndpoints = () => {
  const endpointCounts: { [key: string]: number } = {};
  requestMetrics.forEach(m => {
    endpointCounts[m.path] = (endpointCounts[m.path] || 0) + 1;
  });
  
  return Object.entries(endpointCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }));
};

const getTopIPs = () => {
  const ipCounts: { [key: string]: number } = {};
  requestMetrics.forEach(m => {
    ipCounts[m.ip] = (ipCounts[m.ip] || 0) + 1;
  });
  
  return Object.entries(ipCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([ip, count]) => ({ ip, count }));
};