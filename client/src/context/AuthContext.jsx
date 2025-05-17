import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateProfile: () => Promise.resolve()
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Check if token has expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (token && !isTokenExpired(token)) {
          // Valid token exists, get user profile
          apiClient.setAuthToken(token);
          const { data } = await apiClient.get('/auth/profile');
          setUser(data.user);
        } else if (token) {
          // Token expired, try refresh
          try {
            await refreshToken();
          } catch (error) {
            // Refresh failed, clear auth state
            handleLogout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('accessToken');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Refresh token handler
  const refreshToken = async () => {
    try {
      const { data } = await apiClient.post('/auth/refresh');
      
      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        apiClient.setAuthToken(data.accessToken);
        
        // Re-fetch user profile
        const profileResponse = await apiClient.get('/auth/profile');
        setUser(profileResponse.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  // Login handler
  const handleLogin = async (credentials) => {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      
      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        apiClient.setAuthToken(data.accessToken);
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Register handler
  const handleRegister = async (userData) => {
    try {
      const { data } = await apiClient.post('/auth/register', userData);
      
      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        apiClient.setAuthToken(data.accessToken);
        setUser(data.user);
        return { success: true };
      }
      
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      apiClient.setAuthToken(null);
      setUser(null);
      navigate('/');
    }
  }, [navigate]);

  // Update profile handler
  const handleUpdateProfile = async (profileData) => {
    try {
      const { data } = await apiClient.put('/users/profile', profileData);
      
      if (data.success) {
        setUser(prevUser => ({
          ...prevUser,
          ...data.data
        }));
        return { success: true };
      }
      
      return { success: false, message: 'Profile update failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      return { success: false, message };
    }
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isInitialized,
    hasRole,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};