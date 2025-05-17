import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateComment } from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/comments/:postId
 * @desc    Create a comment on a post
 * @access  Private
 */
router.post(
  '/:postId', 
  protect, 
  validateComment, 
  async (req, res, next) => {
    try {
      const { content, parent } = req.body;
      const postId = req.params.postId;

      // Check if post exists
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check if parent comment exists if provided
      if (parent) {
        const parentComment = await Comment.findById(parent);
        if (!parentComment) {
          return res.status(404).json({
            success: false,
            message: 'Parent comment not found'
          });
        }
      }

      // Create comment
      const comment = await Comment.create({
        post: postId,
        user: req.user.id,
        content,
        parent
      });

      // Populate user info
      await comment.populate('user', 'name profilePicture');

      res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/comments/:postId
 * @desc    Get all comments for a post
 * @access  Public
 */
router.get('/:postId', async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const parent = req.query.parent || null;

    // Find post comments, optionally filtered by parent
    const comments = await Comment.find({ 
      post: postId,
      parent
    })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment
 * @access  Private (comment owner only)
 */
router.put('/:id', protect, validateComment, async (req, res, next) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check comment ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    // Update comment
    comment.content = content;
    comment.isEdited = true;
    
    await comment.save();
    await comment.populate('user', 'name profilePicture');

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment
 * @access  Private (comment owner or admin)
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const commentId = req.params.id;

    // Find comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment owner or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment removed'
    });
  } catch (error) {
    next(error);
  }
});

export default router;