import React from 'react';
import { Eye } from 'lucide-react';

const Loading = ({ 
  message = 'Loading...', 
  size = 'medium',
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50' 
    : '';

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${containerClasses}`}>
      <div className="relative mb-4">
        {/* Animated Eye Icon */}
        <div className="relative">
          <Eye className={`${sizeClasses[size]} text-primary-500 animate-pulse`} />
          <div className="absolute inset-0">
            <div className={`${sizeClasses[size]} border-2 border-transparent border-t-primary-400 border-r-primary-400 rounded-full animate-spin`}></div>
          </div>
        </div>
        
        {/* Pulse Ring */}
        <div className="absolute inset-0 -m-2">
          <div className={`${sizeClasses[size]} border-2 border-primary-500/30 rounded-full animate-ping`}></div>
        </div>
      </div>
      
      <p className="text-navy-300 font-medium animate-pulse">{message}</p>
      
      {/* Loading Dots */}
      <div className="flex space-x-1 mt-4">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

// Simple inline loading component
export const InlineLoading = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="spinner"></div>
  </div>
);

// Button loading state
export const ButtonLoading = ({ children, loading, ...props }) => (
  <button 
    {...props} 
    disabled={loading || props.disabled}
    className={`${props.className} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 border-2 border-transparent border-t-white border-r-white rounded-full animate-spin"></div>
        <span>Processing...</span>
      </div>
    ) : (
      children
    )}
  </button>
);

export default Loading;