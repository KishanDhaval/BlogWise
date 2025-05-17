import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const CommentForm = ({ postId, parentId = null, onCommentAdded }) => {
  const { isAuthenticated, user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const { data } = await apiClient.post(`/comments/${postId}`, {
        content,
        parent: parentId
      });
      
      if (data.success) {
        setContent('');
        if (onCommentAdded) {
          onCommentAdded(data.data);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 rounded-lg p-4 text-center">
        <p className="text-slate-600 mb-2">Login to join the conversation</p>
        <a 
          href="/login" 
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
        >
          Log In
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex-shrink-0 flex items-center justify-center text-emerald-700 uppercase font-bold">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        
        <div className="flex-grow">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentId ? "Write a reply..." : "Join the discussion..."}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={parentId ? 2 : 3}
          ></textarea>
          
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                px-4 py-2 bg-emerald-600 text-white rounded-md transition-colors
                ${isSubmitting 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-emerald-700'
                }
              `}
            >
              {isSubmitting 
                ? (parentId ? 'Replying...' : 'Posting...') 
                : (parentId ? 'Reply' : 'Post Comment')
              }
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;