// 🔧 ENVIRONMENT-SPECIFIC SECURITY CONFIGURATION

export interface SecurityConfig {
  cors: {
    origins: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
    apiMax: number;
    authMax: number;
  };
  csp: {
    enableNonce: boolean;
    reportUri?: string;
  };
  monitoring: {
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    enableMetrics: boolean;
    retentionDays: number;
  };
}

const developmentConfig: SecurityConfig = {
  cors: {
    origins: ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000', 
              'https://*.replit.dev', 'https://*.kirk.replit.dev'],
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Generous for development
    apiMax: 500,
    authMax: 50
  },
  csp: {
    enableNonce: false, // Disabled for Vite HMR
    reportUri: undefined
  },
  monitoring: {
    logLevel: 'debug',
    enableMetrics: true,
    retentionDays: 1
  }
};

const productionConfig: SecurityConfig = {
  cors: {
    origins: [
      process.env.FRONTEND_URL || 'https://superfruitcenter.netlify.app',
      process.env.CUSTOM_DOMAIN || 'https://your-custom-domain.com'
    ].filter(Boolean),
    credentials: true
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Strict limits for production
    apiMax: 50,
    authMax: 5
  },
  csp: {
    enableNonce: true,
    reportUri: '/api/csp-report'
  },
  monitoring: {
    logLevel: 'error',
    enableMetrics: true,
    retentionDays: 30
  }
};

export const getSecurityConfig = (): SecurityConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return { ...productionConfig, monitoring: { ...productionConfig.monitoring, logLevel: 'warn' } };
    default:
      return developmentConfig;
  }
};

// Security feature flags
export const securityFeatures = {
  enableAdvancedThreatDetection: process.env.ENABLE_THREAT_DETECTION === 'true',
  enableIPWhitelisting: process.env.ENABLE_IP_WHITELIST === 'true',
  enableGeoBlocking: process.env.ENABLE_GEO_BLOCKING === 'true',
  enableBehavioralAnalysis: process.env.ENABLE_BEHAVIORAL_ANALYSIS === 'true'
};

// Trusted IP ranges (for internal APIs)
export const trustedIPs = [
  '127.0.0.1', // localhost
  '::1', // localhost IPv6
  ...(process.env.TRUSTED_IPS?.split(',') || [])
];

// Security headers for different environments
export const getSecurityHeaders = () => {
  const config = getSecurityConfig();
  
  return {
    'X-API-Version': '1.0.0',
    'X-Security-Level': 'high',
    'X-Environment': process.env.NODE_ENV || 'development',
    'X-Rate-Limit-Policy': `${config.rateLimit.max};w=${config.rateLimit.windowMs / 1000}`,
    ...(config.monitoring.enableMetrics && { 'X-Monitoring': 'enabled' })
  };
};