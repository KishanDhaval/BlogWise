import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PenLine, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      path: '/dashboard',
      exact: true,
      icon: <LayoutDashboard size={20} />,
      label: 'Dashboard'
    },
    {
      path: '/dashboard/create',
      icon: <PenLine size={20} />,
      label: 'Create Post'
    },
    {
      path: '/dashboard/profile',
      icon: <User size={20} />,
      label: 'Profile'
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-slate-200 
          transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6 lg:mb-10 pt-2">
            <h1 className="text-xl font-bold text-emerald-600">Author Dashboard</h1>
            <button 
              className="p-1 rounded-md hover:bg-slate-100 lg:hidden"
              onClick={closeMobileMenu}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-grow space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={closeMobileMenu}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
                {item.exact && <ChevronRight size={16} className="ml-auto" />}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <div className="flex items-center px-4 py-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold mr-3">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow truncate">
                <div className="font-medium text-slate-900 truncate">{user?.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between px-4 h-16">
            <button 
              className="p-1 rounded-md hover:bg-slate-100" 
              onClick={toggleMobileMenu}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-emerald-600">BlogWise</h1>
            <NavLink to="/" className="text-sm text-slate-600 hover:text-slate-900">
              View Blog
            </NavLink>
          </div>
        </header>

        {/* Main scroll area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;