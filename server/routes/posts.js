import express from 'express';
import Post from '../models/Post.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validatePost } from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private (authors and admins only)
 */
router.post(
  '/', 
  protect, 
  authorize(['author', 'admin']), 
  validatePost, 
  async (req, res, next) => {
    try {
      const { title, content, tags, coverImage, status, excerpt } = req.body;

      const post = await Post.create({
        title,
        content,
        excerpt,
        author: req.user.id,
        tags: tags || [],
        coverImage,
        status,
        publishedAt: status === 'published' ? Date.now() : null
      });

      res.status(201).json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/posts
 * @desc    Get all published posts with pagination
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const tag = req.query.tag;
    const search = req.query.search;

    // Build query
    let query = { status: 'published' };
    
    // Add tag filter if provided
    if (tag) {
      query.tags = tag;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const totalPosts = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .populate('author', 'name profilePicture')
      .select('-content') // Exclude full content for list view
      .sort({ publishedAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {
      total: totalPosts,
      pages: Math.ceil(totalPosts / limit),
      page,
      limit
    };

    res.json({
      success: true,
      count: posts.length,
      pagination,
      data: posts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/posts/:slug
 * @desc    Get post by slug
 * @access  Public
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const post = await Post.findOne({ 
      slug: req.params.slug,
      status: 'published'
    })
      .populate('author', 'name bio profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name profilePicture'
        },
        match: { parent: null } // Only get top-level comments
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/posts/user/me
 * @desc    Get current user's posts
 * @access  Private (authors and admins)
 */
router.get(
  '/user/me', 
  protect, 
  authorize(['author', 'admin']), 
  async (req, res, next) => {
    try {
      const posts = await Post.find({ author: req.user.id })
        .sort({ createdAt: -1 })
        .select('-content');

      res.json({
        success: true,
        count: posts.length,
        data: posts
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private (post author or admin)
 */
router.put(
  '/:id', 
  protect, 
  validatePost, 
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check if user is post author or admin
      if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this post'
        });
      }

      const { title, content, tags, coverImage, status, excerpt } = req.body;
      
      // If post is being published for the first time
      const wasPublished = post.status !== 'published' && status === 'published';
      
      // Update post
      post.title = title;
      post.content = content;
      post.excerpt = excerpt;
      post.tags = tags || [];
      post.coverImage = coverImage;
      post.status = status;
      
      // Set publishedAt if publishing for the first time
      if (wasPublished) {
        post.publishedAt = Date.now();
      }
      
      await post.save();

      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private (post author or admin)
 */
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is post author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.json({
      success: true,
      message: 'Post removed'
    });
  } catch (error) {
    next(error);
  }
});

export default router;