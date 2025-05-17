import { validationResult, body } from 'express-validator';

/**
 * Middleware to validate request body
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

/**
 * Validate user registration
 */
export const validateRegister = [
  body('name')
    .not().isEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 50 }).withMessage('Password cannot exceed 50 characters'),
  validateRequest
];

/**
 * Validate user login
 */
export const validateLogin = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .not().isEmpty().withMessage('Password is required'),
  validateRequest
];

/**
 * Validate post creation/update
 */
export const validatePost = [
  body('title')
    .not().isEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('content')
    .not().isEmpty().withMessage('Content is required'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  validateRequest
];

/**
 * Validate comment creation
 */
export const validateComment = [
  body('content')
    .not().isEmpty().withMessage('Comment content is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
  validateRequest
];