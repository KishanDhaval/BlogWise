import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { User, Mail, Info, Check } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear status messages
    setSubmitError('');
    setSubmitSuccess('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (profileData.bio && profileData.bio.length > 250) {
      newErrors.bio = 'Bio cannot exceed 250 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    
    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        setSubmitSuccess('Profile updated successfully');
      } else {
        setSubmitError(result.message || 'Failed to update profile');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred');
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Your Profile</h1>
      
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
          <Check size={20} className="mr-2" />
          {submitSuccess}
        </div>
      )}
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {submitError}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl mr-4">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-slate-500">{user?.email}</p>
            <div className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
        
        {/* Account stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-center">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-500 text-sm mb-1">Member Since</p>
            <p className="font-medium">
              {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-500 text-sm mb-1">Posts</p>
            <p className="font-medium">
              {/* This would be dynamic in a real app */}
              {Math.floor(Math.random() * 20)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="form-label">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className={`
                  form-input pl-10
                  ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}
                `}
                placeholder="Your name"
              />
            </div>
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                id="email"
                value={user?.email}
                disabled
                className="form-input pl-10 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Email cannot be changed
            </p>
          </div>
          
          <div>
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <Info size={18} className="text-slate-400" />
              </div>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                rows={4}
                className={`
                  form-input pl-10
                  ${errors.bio ? 'border-red-300 focus:ring-red-500' : ''}
                `}
                placeholder="Tell us about yourself"
              />
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-sm text-slate-500">
                Brief description for your profile
              </p>
              <p className={`text-sm ${profileData.bio.length > 230 ? 'text-amber-600' : 'text-slate-500'}`}>
                {profileData.bio.length}/250
              </p>
            </div>
            {errors.bio && <p className="form-error">{errors.bio}</p>}
          </div>
          
          <div>
            <label htmlFor="profilePicture" className="form-label">
              Profile Picture URL
            </label>
            <input
              type="text"
              id="profilePicture"
              name="profilePicture"
              value={profileData.profilePicture}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/profile.jpg"
            />
            <p className="text-sm text-slate-500 mt-1">
              Enter a URL for your profile picture (optional)
            </p>
            
            {profileData.profilePicture && (
              <div className="mt-2 flex items-center">
                <img 
                  src={profileData.profilePicture} 
                  alt="Profile preview" 
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                  }}
                />
                <span className="ml-2 text-sm text-slate-500">Preview</span>
              </div>
            )}
          </div>
          
          <div className="pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                btn-primary
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;