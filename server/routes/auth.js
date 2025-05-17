import express from 'express';
import User from '../models/User.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken 
} from '../utils/jwtUtils.js';
import { 
  validateRegister, 
  validateLogin 
} from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register user
 * @access  Public
 */
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { name, email, password, role = 'reader' } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Create user with hashed password
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: role === 'admin' ? 'reader' : role // Prevent creating admin users directly
    });

    if (user) {
      // Generate tokens
      const accessToken = generateAccessToken({ 
        id: user._id, 
        role: user.role 
      });
      
      const refreshToken = generateRefreshToken({ 
        id: user._id,
        role: user.role
      });

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict'
      });

      res.status(201).json({
        success: true,
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get tokens
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+passwordHash +refreshToken');
    
    // Check user and password
    if (user && (await user.matchPassword(password))) {
      // Generate tokens
      const accessToken = generateAccessToken({ 
        id: user._id, 
        role: user.role 
      });
      
      const refreshToken = generateRefreshToken({ 
        id: user._id,
        role: user.role
      });

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict'
      });

      res.json({
        success: true,
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token)
 */
router.post('/refresh', async (req, res, next) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }

    // Verify refresh token
    const decoded = verifyToken(
      refreshToken, 
      process.env.REFRESH_TOKEN_SECRET || 'refresh_token_secret'
    );

    // Find user with this refresh token
    const user = await User.findOne({ 
      _id: decoded.id,
      refreshToken
    });

    if (!user) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
    }

    // Generate new tokens
    const accessToken = generateAccessToken({ 
      id: user._id, 
      role: user.role 
    });
    
    const newRefreshToken = generateRefreshToken({ 
      id: user._id,
      role: user.role
    });

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict'
    });

    res.json({
      success: true,
      accessToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Refresh token expired' 
      });
    }
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookie
 * @access  Private
 */
router.post('/logout', protect, async (req, res, next) => {
  try {
    // Clear refresh token in database
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    // Clear cookie
    res.clearCookie('refreshToken');

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user) {
      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;