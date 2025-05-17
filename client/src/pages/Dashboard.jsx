import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '../api/client';
import Spinner from '../components/ui/Spinner';
import { 
  Plus, 
  Edit, 
  Trash, 
  Eye, 
  AlertCircle,
  Clock,
  FileText,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await apiClient.get('/posts/user/me');
        
        if (data.success) {
          setPosts(data.data);
          
          // Calculate stats
          const published = data.data.filter(post => post.status === 'published').length;
          setStats({
            total: data.data.length,
            published,
            drafts: data.data.length - published
          });
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load your posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const { data } = await apiClient.delete(`/posts/${id}`);
        
        if (data.success) {
          // Update posts list
          const updatedPosts = posts.filter(post => post._id !== id);
          setPosts(updatedPosts);
          
          // Update stats
          const published = updatedPosts.filter(post => post.status === 'published').length;
          setStats({
            total: updatedPosts.length,
            published,
            drafts: updatedPosts.length - published
          });
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const getStatusBadge = (status) => {
    return status === 'published' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle size={12} className="mr-1" />
        Published
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock size={12} className="mr-1" />
        Draft
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Posts</h1>
          <p className="text-slate-500 mt-1">Manage and monitor your content</p>
        </div>
        <Link
          to="/dashboard/create"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={18} className="mr-1" />
          New Post
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Posts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Published</p>
              <p className="text-2xl font-bold text-slate-900">{stats.published}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Drafts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.drafts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="large" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-slate-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-primary"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No posts yet</h3>
            <p className="text-slate-500 mb-6">Get started by creating your first blog post</p>
            <Link
              to="/dashboard/create"
              className="btn-primary"
            >
              Create a post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <div className="flex items-center">
                        {post.coverImage && (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-10 h-10 rounded object-cover mr-3 flex-shrink-0"
                          />
                        )}
                        <div className="truncate max-w-xs">{post.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {post.status === 'published' && post.publishedAt
                        ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
                        : formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex space-x-2">
                        {post.status === 'published' && (
                          <a
                            href={`/post/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View post"
                          >
                            <Eye size={18} />
                          </a>
                        )}
                        <Link
                          to={`/dashboard/edit/${post._id}`}
                          className="text-amber-600 hover:text-amber-800 transition-colors"
                          title="Edit post"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete post"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;