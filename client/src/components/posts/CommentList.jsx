import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import CommentForm from './CommentForm';
import apiClient from '../../api/client';
import { Reply, Trash, Edit, User } from 'lucide-react';

const Comment = ({ comment, postId, onDelete, onUpdate }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = user && user.id === comment.user._id;
  const isAdmin = user && user.role === 'admin';
  const canModify = isAuthor || isAdmin;

  const handleEdit = async () => {
    if (!editedContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.put(`/comments/${comment._id}`, {
        content: editedContent
      });
      
      if (data.success) {
        onUpdate(data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const { data } = await apiClient.delete(`/comments/${comment._id}`);
        
        if (data.success) {
          onDelete(comment._id);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const loadReplies = async () => {
    if (!repliesLoaded) {
      try {
        const { data } = await apiClient.get(`/comments/${postId}?parent=${comment._id}`);
        
        if (data.success) {
          setReplies(data.data);
          setRepliesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading replies:', error);
      }
    }
    
    setShowReplies(!showReplies);
  };

  const handleReplyAdded = (newReply) => {
    setReplies([newReply, ...replies]);
    setShowReplies(true);
    setShowReplyForm(false);
  };

  const handleReplyUpdate = (updatedReply) => {
    setReplies(replies.map(reply => 
      reply._id === updatedReply._id ? updatedReply : reply
    ));
  };

  const handleReplyDelete = (replyId) => {
    setReplies(replies.filter(reply => reply._id !== replyId));
  };

  return (
    <div className="mb-6">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-slate-700 uppercase font-bold">
          {comment.user.profilePicture ? (
            <img 
              src={comment.user.profilePicture} 
              alt={comment.user.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={20} />
          )}
        </div>
        
        <div className="flex-grow">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <div>
                <Link 
                  to={`/author/${comment.user._id}`} 
                  className="font-medium text-slate-800 hover:text-emerald-600"
                >
                  {comment.user.name}
                </Link>
                <span className="text-xs text-slate-500 ml-2">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.isEdited && ' (edited)'}
                </span>
              </div>
              
              {canModify && (
                <div className="flex space-x-2">
                  {isAuthor && (
                    <button 
                      onClick={() => setIsEditing(!isEditing)} 
                      className="text-slate-500 hover:text-emerald-600"
                      title="Edit comment"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  <button 
                    onClick={handleDelete} 
                    className="text-slate-500 hover:text-red-600"
                    title="Delete comment"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows={3}
                ></textarea>
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    className={`
                      px-3 py-1 text-sm text-white bg-emerald-600 rounded-md transition-colors
                      ${isSubmitting 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:bg-emerald-700'
                      }
                    `}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-700 whitespace-pre-line">{comment.content}</p>
            )}
          </div>
          
          <div className="flex items-center mt-2 pl-2 space-x-4">
            {user && (
              <button 
                onClick={() => setShowReplyForm(!showReplyForm)} 
                className="text-sm flex items-center text-slate-500 hover:text-emerald-600"
              >
                <Reply size={14} className="mr-1" />
                Reply
              </button>
            )}
            
            {(comment.replies?.length > 0 || replies.length > 0) && (
              <button 
                onClick={loadReplies} 
                className="text-sm flex items-center text-slate-500 hover:text-emerald-600"
              >
                {showReplies ? 'Hide' : 'Show'} {repliesLoaded ? replies.length : comment.replies?.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
          
          {showReplyForm && (
            <div className="mt-4 ml-4">
              <CommentForm 
                postId={postId} 
                parentId={comment._id} 
                onCommentAdded={handleReplyAdded} 
              />
            </div>
          )}
          
          {showReplies && replies.length > 0 && (
            <div className="mt-4 ml-6 pl-6 border-l-2 border-slate-200">
              {replies.map(reply => (
                <Comment 
                  key={reply._id} 
                  comment={reply} 
                  postId={postId}
                  onDelete={handleReplyDelete}
                  onUpdate={handleReplyUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentList = ({ comments, postId }) => {
  const [commentList, setCommentList] = useState(comments || []);

  const handleCommentAdded = (newComment) => {
    setCommentList([newComment, ...commentList]);
  };

  const handleCommentUpdate = (updatedComment) => {
    setCommentList(commentList.map(comment => 
      comment._id === updatedComment._id ? updatedComment : comment
    ));
  };

  const handleCommentDelete = (commentId) => {
    setCommentList(commentList.filter(comment => comment._id !== commentId));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-6">
        {commentList.length} {commentList.length === 1 ? 'Comment' : 'Comments'}
      </h3>
      
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      
      {commentList.length > 0 ? (
        <div>
          {commentList.map(comment => (
            <Comment 
              key={comment._id} 
              comment={comment} 
              postId={postId}
              onDelete={handleCommentDelete}
              onUpdate={handleCommentUpdate}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 my-8">
          Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
};

export default CommentList;