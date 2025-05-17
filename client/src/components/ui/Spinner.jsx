import React from 'react';

const sizeClasses = {
  small: 'h-4 w-4 border-2',
  medium: 'h-8 w-8 border-2',
  large: 'h-12 w-12 border-3'
};

const Spinner = ({ size = 'medium' }) => {
  return (
    <div className="flex justify-center items-center">
      <div 
        className={`
          ${sizeClasses[size]} 
          border-t-emerald-500 border-r-emerald-500 border-b-emerald-200 border-l-emerald-200 
          rounded-full animate-spin
        `}
      />
    </div>
  );
};

export default Spinner;