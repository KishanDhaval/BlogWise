import { verifyToken } from '../utils/jwtUtils.js';

/**
 * Middleware to authenticate users via JWT
 */
export const protect = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer') 
      ? authHeader.split(' ')[1] 
      : null;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }

    // Verify token
    const decoded = verifyToken(
      token, 
      process.env.ACCESS_TOKEN_SECRET || 'access_token_secret'
    );
    
    // Add user from payload
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    });
  }
};

/**
 * Middleware to check user role
 * @param {String[]} roles - Array of allowed roles
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    
    next();
  };
};