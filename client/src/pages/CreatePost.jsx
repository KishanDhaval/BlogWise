import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import apiClient from '../api/client';
import { X, Tag as TagIcon, Save, Send } from 'lucide-react';

const CreatePost = () => {
  const [post, setPost] = useState({
    title: '',
    content: '',
    coverImage: '',
    excerpt: '',
    tags: [],
    status: 'draft'
  });
  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleContentChange = (content) => {
    setPost(prev => ({
      ...prev,
      content
    }));
    
    // Clear error when content is updated
    if (errors.content) {
      setErrors(prev => ({
        ...prev,
        content: ''
      }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!currentTag.trim()) return;
    
    // Prevent duplicate tags
    if (post.tags.includes(currentTag.trim())) {
      setCurrentTag('');
      return;
    }
    
    setPost(prev => ({
      ...prev,
      tags: [...prev.tags, currentTag.trim()]
    }));
    setCurrentTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!post.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!post.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (post.status === 'published') {
      // Additional validations for published posts
      if (post.title.length < 10) {
        newErrors.title = 'Title should be at least 10 characters for published posts';
      }
      
      if (post.content.length < 100) {
        newErrors.content = 'Content should be more substantial for published posts';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const { data } = await apiClient.post('/posts', post);
      
      if (data.success) {
        if (post.status === 'published') {
          navigate(`/post/${data.data.slug}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setSubmitError('Failed to create post');
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to create post');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ]
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create New Post</h1>
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="form-label">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={post.title}
            onChange={handleChange}
            className={`
              form-input 
              ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}
            `}
            placeholder="Enter a descriptive title"
          />
          {errors.title && <p className="form-error">{errors.title}</p>}
        </div>
        
        {/* Cover Image URL */}
        <div>
          <label htmlFor="coverImage" className="form-label">
            Cover Image URL
          </label>
          <input
            type="text"
            id="coverImage"
            name="coverImage"
            value={post.coverImage}
            onChange={handleChange}
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-sm text-slate-500 mt-1">
            Enter a URL for the cover image (optional)
          </p>
          
          {post.coverImage && (
            <div className="mt-2">
              <img 
                src={post.coverImage} 
                alt="Cover preview" 
                className="h-40 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x300?text=Invalid+Image+URL';
                }}
              />
            </div>
          )}
        </div>
        
        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="form-label">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={post.excerpt}
            onChange={handleChange}
            rows={3}
            className="form-input"
            placeholder="Brief summary of your post (optional)"
          />
          <p className="text-sm text-slate-500 mt-1">
            If left empty, an excerpt will be automatically generated from your content
          </p>
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="form-label">
            Tags
          </label>
          <div className="flex">
            <input
              type="text"
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              className="form-input rounded-r-none"
              placeholder="Add a tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 bg-emerald-600 text-white rounded-r-lg hover:bg-emerald-700 transition-colors"
            >
              <TagIcon size={18} />
            </button>
          </div>
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-slate-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div>
          <label htmlFor="content" className="form-label">
            Content <span className="text-red-500">*</span>
          </label>
          <ReactQuill
            value={post.content}
            onChange={handleContentChange}
            modules={modules}
            formats={formats}
            className={`bg-white border ${errors.content ? 'border-red-300' : 'border-slate-300'} rounded-lg`}
            placeholder="Write your post content here..."
          />
          {errors.content && <p className="form-error mt-2">{errors.content}</p>}
        </div>
        
        {/* Status and Submit */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t border-slate-200">
          <div>
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={post.status}
              onChange={handleChange}
              className="form-input w-auto"
            >
              <option value="draft">Save as Draft</option>
              <option value="published">Publish Now</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                btn-primary flex items-center
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {post.status === 'published' ? (
                <>
                  <Send size={18} className="mr-1" />
                  {isSubmitting ? 'Publishing...' : 'Publish'}
                </>
              ) : (
                <>
                  <Save size={18} className="mr-1" />
                  {isSubmitting ? 'Saving...' : 'Save Draft'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;