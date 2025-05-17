import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import apiClient from '../api/client';
import CommentList from '../components/posts/CommentList';
import Spinner from '../components/ui/Spinner';
import { 
  Clock, 
  Calendar, 
  User, 
  Twitter, 
  Facebook, 
  Linkedin,
  Link2, 
  ChevronLeft 
} from 'lucide-react';

const PostDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/posts/${slug}`);
        
        if (data.success) {
          setPost(data.data);
          
          // Fetch related posts (by same author or similar tags)
          // In a real app, this would be a dedicated API endpoint
          const { data: postsData } = await apiClient.get(`/posts?limit=3`);
          setRelatedPosts(postsData.data.filter(p => p._id !== data.data._id).slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const shareUrl = window.location.href;
  const shareTitle = post?.title || 'Check out this blog post';

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-narrow mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-600 p-8 rounded-lg text-center">
          <p className="mb-4 text-lg">{error}</p>
          <Link to="/" className="btn-primary">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-narrow mx-auto px-4 py-12">
        <div className="bg-slate-50 p-8 rounded-lg text-center">
          <p className="mb-4 text-lg">Post not found.</p>
          <Link to="/" className="btn-primary">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero section */}
      {post.coverImage ? (
        <div className="relative h-[50vh] min-h-[400px] bg-slate-900 overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
          <div className="container-narrow mx-auto px-4 relative z-10 h-full flex flex-col justify-end pb-12">
            <Link to="/" className="text-white opacity-70 hover:opacity-100 transition-opacity flex items-center mb-4">
              <ChevronLeft size={20} className="mr-1" />
              Back to all posts
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{post.title}</h1>
          </div>
        </div>
      ) : (
        <div className="container-narrow mx-auto px-4 pt-12">
          <Link to="/" className="text-slate-500 hover:text-slate-700 transition-colors flex items-center mb-6">
            <ChevronLeft size={20} className="mr-1" />
            Back to all posts
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{post.title}</h1>
        </div>
      )}

      <div className="container-narrow mx-auto px-4 py-8">
        {/* Meta information */}
        <div className={`flex flex-wrap items-center justify-between mb-8 ${post.coverImage ? 'border-b border-slate-200 pb-8' : ''}`}>
          {/* Author info */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link to={`/author/${post.author._id}`} className="flex items-center group">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mr-3">
                {post.author.profilePicture ? (
                  <img 
                    src={post.author.profilePicture} 
                    alt={post.author.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-800 group-hover:text-emerald-600 transition-colors">
                  {post.author.name}
                </p>
                <p className="text-sm text-slate-500">
                  {post.author.bio ? post.author.bio.substring(0, 60) + (post.author.bio.length > 60 ? '...' : '') : 'Author'}
                </p>
              </div>
            </Link>
          </div>

          {/* Date and reading time */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center" title="Published date">
              <Calendar size={18} className="mr-1" />
              <time dateTime={post.publishedAt}>
                {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
              </time>
            </div>
            <div className="flex items-center" title="Reading time">
              <Clock size={18} className="mr-1" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <Link 
                key={index} 
                to={`/?tag=${tag}`}
                className="text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Main content */}
        <article className="prose prose-slate prose-lg max-w-none mb-12 blog-content" 
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share links */}
        <div className="border-t border-slate-200 pt-8 mb-12">
          <p className="font-medium text-slate-700 mb-3">Share this post</p>
          <div className="flex gap-2">
            <a 
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              title="Share on Twitter"
            >
              <Twitter size={20} />
            </a>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              title="Share on Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              title="Share on LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
              }}
              className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              title="Copy link"
            >
              <Link2 size={20} />
            </button>
          </div>
        </div>

        {/* Author bio */}
        <div className="border-t border-slate-200 pt-8 mb-12">
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 flex-shrink-0">
                {post.author.profilePicture ? (
                  <img 
                    src={post.author.profilePicture} 
                    alt={post.author.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold mb-2">{post.author.name}</h3>
                <p className="text-slate-600 mb-4">{post.author.bio || 'Author at BlogWise'}</p>
                <Link 
                  to={`/author/${post.author._id}`} 
                  className="inline-flex items-center text-emerald-600 hover:text-emerald-700"
                >
                  View all posts by this author
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="border-t border-slate-200 pt-8">
          <CommentList comments={post.comments} postId={post._id} />
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-slate-50 py-12">
          <div className="container-wide mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost._id} className="card h-full flex flex-col">
                  {relatedPost.coverImage && (
                    <Link to={`/post/${relatedPost.slug}`} className="block overflow-hidden aspect-video">
                      <img 
                        src={relatedPost.coverImage} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </Link>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold mb-2 hover:text-emerald-600 transition-colors line-clamp-2">
                      <Link to={`/post/${relatedPost.slug}`}>{relatedPost.title}</Link>
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                      {relatedPost.excerpt}
                    </p>
                    <div className="mt-auto pt-4 flex justify-between items-center text-xs text-slate-500">
                      <Link to={`/author/${relatedPost.author._id}`} className="hover:text-emerald-600">
                        {relatedPost.author.name}
                      </Link>
                      <time dateTime={relatedPost.publishedAt}>
                        {formatDistanceToNow(new Date(relatedPost.publishedAt), { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;