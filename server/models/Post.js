import mongoose from 'mongoose';
import slugify from 'slugify';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  coverImage: {
    type: String
  },
  publishedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  readTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate slug from title
postSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    next();
    return;
  }
  this.slug = slugify(this.title, { lower: true, strict: true });
  
  // Generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    // Strip HTML tags and get first 200 characters
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  
  // Calculate read time (assuming average reading speed of 200 words per minute)
  const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / 200);
  
  next();
});

// Add unique index to prevent duplicate slugs
postSchema.index({ slug: 1 });

// Virtual populate comments
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  justOne: false
});

const Post = mongoose.model('Post', postSchema);

export default Post;