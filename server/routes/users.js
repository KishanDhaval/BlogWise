import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/authors
 * @desc    Get all authors
 * @access  Public
 */
router.get('/authors', async (req, res, next) => {
  try {
    const authors = await User.find({ 
      role: { $in: ['author', 'admin'] } 
    })
      .select('name bio profilePicture')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: authors.length,
      data: authors
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name bio profilePicture role createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, bio, profilePicture } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role
 * @access  Private (admin only)
 */
router.put(
  '/:id/role', 
  protect, 
  authorize(['admin']), 
  async (req, res, next) => {
    try {
      const { role } = req.body;
      
      if (!role || !['reader', 'author', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Valid role is required'
        });
      }

      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.role = role;
      await user.save();

      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;