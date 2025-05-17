import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import PostCard from '../components/posts/PostCard';
import Spinner from '../components/ui/Spinner';
import { ArrowLeft, User, Mail, Calendar, AlertCircle } from 'lucide-react';

const AuthorPosts = () => {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuthorAndPosts = async () => {
      setLoading(true);
      try {
        // Fetch author details
        const { data: authorData } = await apiClient.get(`/users/${id}`);
        
        if (authorData.success) {
          setAuthor(authorData.data);
        }
        
        // In a real app, this would be a dedicated API endpoint
        // For demo, we'll fetch all posts and filter by author
        const { data: postsData } = await apiClient.get('/posts');
        
        if (postsData.success) {
          // Filter posts by author
          const authorPosts = postsData.data.filter(
            post => post.author._id === id
          );
          setPosts(authorPosts);
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        setError('Failed to load author information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorAndPosts();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-600 p-8 rounded-lg text-center">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p className="mb-4 text-lg">{error}</p>
          <Link to="/" className="btn-primary">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container-wide mx-auto px-4 py-12">
        <div className="bg-slate-50 p-8 rounded-lg text-center">
          <p className="mb-4 text-lg">Author not found.</p>
          <Link to="/" className="btn-primary">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8">
        <ArrowLeft size={20} className="mr-2" />
        Back to all posts
      </Link>
      
      {/* Author profile */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-4xl font-bold">
            {author.profilePicture ? (
              <img 
                src={author.profilePicture} 
                alt={author.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              author.name.charAt(0).toUpperCase()
            )}
          </div>
          
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl font-bold mb-3">{author.name}</h1>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 capitalize mb-4">
              {author.role}
            </div>
            
            {author.bio && (
              <p className="text-slate-600 text-lg mb-6 max-w-2xl">
                {author.bio}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1.5" />
                <span>
                  Joined {new Date(author.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <User size={16} className="mr-1.5" />
                <span>{posts.length} Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Author's posts */}
      <h2 className="text-2xl font-bold mb-8">
        {posts.length > 0 
          ? `Posts by ${author.name}`
          : `${author.name} hasn't published any posts yet`
        }
      </h2>
      
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 p-8 rounded-lg text-center">
          <p className="text-slate-600 mb-6">
            Check back later for new content from this author.
          </p>
          <Link to="/" className="btn-primary">
            Browse other posts
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthorPosts;