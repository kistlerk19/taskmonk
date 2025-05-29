import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary-600',
  fullScreen = false,
}) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-4',
  };

  // Use a safer approach for dynamic classes
  const colorClass = `border-${color}`;
  
  const spinner = (
    <div className={`animate-spin rounded-full border-t-transparent ${colorClass} ${sizeClasses[size]}`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center">{spinner}</div>;
};

export default LoadingSpinner;