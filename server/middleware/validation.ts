import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// 🔍 INPUT VALIDATION MIDDLEWARE
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    (error as any).status = 400;
    (error as any).errors = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg,
      value: err.type === 'field' ? err.value : undefined
    }));
    return next(error);
  }
  next();
};

// 📧 Email validation
export const validateEmail = () => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address is too long')
];

// 📱 Phone number validation
export const validatePhone = () => [
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10-15 digits')
];

// 👤 User data validation
export const validateUserData = () => [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters')
    .escape() // Sanitize HTML entities
];

// 🛒 Order validation
export const validateOrder = () => [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.product_id')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Product ID is required and must be valid'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1-100'),
  
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('total_amount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  
  body('delivery_address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Delivery address must be between 10-200 characters')
    .escape()
];

// 🔐 ID parameter validation
export const validateId = (paramName = 'id') => [
  param(paramName)
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage(`${paramName} must be a valid identifier`)
    .escape()
];

// 🔍 Search query validation
export const validateSearchQuery = () => [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters')
    .escape(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1-50')
    .toInt(),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be 0 or greater')
    .toInt()
];

// 💳 Payment validation
export const validatePayment = () => [
  body('amount')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Amount must be between $0.01 and $10,000'),
  
  body('currency')
    .isIn(['USD', 'EUR', 'INR'])
    .withMessage('Currency must be USD, EUR, or INR'),
  
  body('payment_method')
    .isIn(['card', 'upi', 'wallet', 'cod'])
    .withMessage('Invalid payment method')
];

// 🔒 Sanitize input to prevent XSS
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Recursively sanitize all string values in request body
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

// ⏰ Request timeout middleware
export const requestTimeout = (timeoutMs = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: true,
          status: 408,
          message: 'Request timeout - operation took too long'
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  };
};