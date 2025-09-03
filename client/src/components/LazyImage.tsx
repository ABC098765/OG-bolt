import React, { useState, useRef, useEffect, memo } from 'react';
import Lottie from 'lottie-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
}

// Loading animation state
const useLoadingAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/bouncing-fruits-new.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(() => {
        // Fallback to original bouncing fruits animation
        fetch('/bouncing-fruits.json')
          .then(response => response.json())
          .then(data => setAnimationData(data))
          .catch(console.error);
      });
  }, []);

  return animationData;
};

const LazyImage = memo<LazyImageProps>(({ 
  src, 
  alt, 
  className = '', 
  placeholder = '',
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const animationData = useLoadingAnimation();

  // Simplified approach - just load the image directly
  const handleImageLoad = () => {
    setIsLoaded(true);
    setShowAnimation(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setShowAnimation(false);
  };

  return (
    <div className="relative">
      {/* Bouncing Fruits Loading Animation */}
      {showAnimation && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700 z-10 rounded-lg">
          {animationData ? (
            <Lottie 
              animationData={animationData}
              loop={true}
              style={{ width: 80, height: 80 }}
              className="drop-shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse">
            </div>
          )}
        </div>
      )}
      
      {/* Actual Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={loading}
      />
      
      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-600 rounded-lg">
          <div className="text-gray-500 dark:text-gray-400 text-center p-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;