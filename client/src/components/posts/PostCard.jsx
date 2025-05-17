import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User } from 'lucide-react';

const PostCard = ({ post }) => {
  return (
    <article className="card group transition-all duration-300 h-full flex flex-col">
      {/* Post image */}
      {post.coverImage && (
        <Link to={`/post/${post.slug}`} className="block overflow-hidden aspect-video">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      )}
      
      {/* Post content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Link 
                key={index} 
                to={`/?tag=${tag}`}
                className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Title */}
        <h2 className="text-xl md:text-2xl font-serif font-bold mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
          <Link to={`/post/${post.slug}`}>{post.title}</Link>
        </h2>
        
        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-slate-600 mb-4 line-clamp-3 flex-grow">
            {post.excerpt}
          </p>
        )}
        
        {/* Meta information */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          {/* Author info */}
          <Link to={`/author/${post.author._id}`} className="flex items-center group/author">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mr-2">
              {post.author.profilePicture ? (
                <img 
                  src={post.author.profilePicture} 
                  alt={post.author.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={16} />
              )}
            </div>
            <span className="text-sm text-slate-600 group-hover/author:text-emerald-600">
              {post.author.name}
            </span>
          </Link>
          
          {/* Reading time and date */}
          <div className="flex items-center text-xs text-slate-500">
            <div className="flex items-center mr-3" title="Reading time">
              <Clock size={14} className="mr-1" />
              <span>{post.readTime} min read</span>
            </div>
            {post.publishedAt && (
              <time dateTime={post.publishedAt} title={new Date(post.publishedAt).toLocaleDateString()}>
                {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
              </time>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;