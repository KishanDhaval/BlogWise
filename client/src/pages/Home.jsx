import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import PostCard from '../components/posts/PostCard';
import Spinner from '../components/ui/Spinner';
import { Search, Bookmark, TrendingUp, Tag } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [tags, setTags] = useState([]);

  const page = Number(searchParams.get('page')) || 1;
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let url = `/posts?page=${page}`;
        if (tag) url += `&tag=${tag}`;
        if (search) url += `&search=${search}`;

        const { data } = await apiClient.get(url);
        
        setPosts(data.data);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, tag, search]);

  // Fetch popular tags (in a real app, this would be a separate API endpoint)
  useEffect(() => {
    const fetchTags = async () => {
      // This is simulated - in a real app, you'd have an API endpoint for this
      setTags(['Programming', 'Technology', 'Web Development', 'Design', 'AI', 'Data Science']);
    };

    fetchTags();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageTitle = () => {
    if (search) return `Search results for "${search}"`;
    if (tag) return `Posts tagged with "${tag}"`;
    return 'Latest Posts';
  };

  return (
    <div>
      {/* Hero section */}
      <section className="relative bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>
        <div className="container-wide mx-auto py-12 md:py-24 px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Discover stories, thinking, and expertise
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Read and share ideas from independent voices, world-class publications, and experts from around the globe.
            </p>
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search for topics, authors, or keywords..."
                value={search}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  params.set('search', e.target.value);
                  params.delete('page');
                  setSearchParams(params);
                }}
                className="w-full pl-12 pr-4 py-3 text-slate-900 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-wide mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <main className="md:w-3/4">
            <header className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{getPageTitle()}</h2>
              {pagination.total > 0 && (
                <p className="text-slate-500">
                  Showing {posts.length} of {pagination.total} posts
                </p>
              )}
            </header>

            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="large" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-slate-50 p-8 rounded-lg text-center">
                <p className="text-slate-600 mb-4">No posts found.</p>
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    setSearchParams(params);
                  }}
                  className="btn-primary"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className={`
                          p-2 rounded-md flex items-center justify-center
                          ${page === 1
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-100'
                          }
                        `}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === pagination.pages || (p >= page - 1 && p <= page + 1))
                        .map((p, i, arr) => (
                          <React.Fragment key={p}>
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span className="text-slate-400">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(p)}
                              className={`
                                w-10 h-10 rounded-md flex items-center justify-center
                                ${p === page
                                  ? 'bg-emerald-600 text-white font-medium'
                                  : 'text-slate-600 hover:bg-slate-100'
                                }
                              `}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        ))}
                      
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.pages}
                        className={`
                          p-2 rounded-md flex items-center justify-center
                          ${page === pagination.pages
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-100'
                          }
                        `}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Sidebar */}
          <aside className="md:w-1/4">
            {/* Popular tags */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Tag size={18} className="mr-2 text-emerald-600" />
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('tag', t);
                      params.delete('page');
                      params.delete('search');
                      setSearchParams(params);
                    }}
                    className={`
                      px-3 py-1.5 text-sm rounded-full transition-colors
                      ${tag === t
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading list promo */}
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-lg shadow-sm border border-emerald-100 p-5 mb-6">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <Bookmark size={18} className="mr-2 text-emerald-600" />
                Start Your Reading List
              </h3>
              <p className="text-slate-600 mb-4">
                Create an account to bookmark articles and receive personalized recommendations.
              </p>
              <a
                href="/register"
                className="block text-center py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Sign up for free
              </a>
            </div>

            {/* Trending posts */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <TrendingUp size={18} className="mr-2 text-emerald-600" />
                Trending This Week
              </h3>
              <div className="space-y-4">
                {/* This would be dynamic in a real app */}
                {[1, 2, 3].map((i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="block group"
                  >
                    <div className="flex items-start">
                      <span className="flex-shrink-0 font-bold text-xl text-slate-300 mr-3">{i}</span>
                      <div>
                        <h4 className="font-medium text-slate-800 group-hover:text-emerald-600 transition-colors">
                          {i === 1 && "The Future of Web Development in 2025"}
                          {i === 2 && "10 Essential Tips for Better Writing"}
                          {i === 3 && "How AI is Transforming the Creative Industry"}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {i === 1 && "3.2k reads • 5 days ago"}
                          {i === 2 && "2.8k reads • 3 days ago"}
                          {i === 3 && "1.9k reads • 7 days ago"}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;