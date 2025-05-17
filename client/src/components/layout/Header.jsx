import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Search, Menu, X, User } from 'lucide-react';

const Header = ({ scrolled }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header 
      className={`
        sticky top-0 z-10 transition-all duration-300
        ${scrolled 
          ? 'bg-white shadow-md' 
          : 'bg-gradient-to-b from-slate-50 to-transparent'
        }
      `}
    >
      <div className="container-wide mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-emerald-600 font-serif">
            <BookOpen className="h-8 w-8" />
            <span className="text-xl font-bold hidden sm:block">BlogWise</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'text-emerald-600' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }
              `}
            >
              Home
            </NavLink>

            {/* Conditional dashboard link */}
            {isAuthenticated && (user.role === 'author' || user.role === 'admin') && (
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'text-emerald-600' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Desktop Search & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </form>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 text-sm font-medium text-slate-700 px-3 py-2 rounded-full hover:bg-slate-100">
                  <span>{user.name}</span>
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                </button>

                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {(user.role === 'author' || user.role === 'admin') && (
                    <Link 
                      to="/dashboard" 
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link 
                    to="/dashboard/profile" 
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2">
              <NavLink 
                to="/" 
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                Home
              </NavLink>

              {isAuthenticated ? (
                <>
                  {/* Conditional dashboard link */}
                  {(user.role === 'author' || user.role === 'admin') && (
                    <NavLink 
                      to="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }
                      `}
                    >
                      Dashboard
                    </NavLink>
                  )}
                  <NavLink 
                    to="/dashboard/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Log in
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;