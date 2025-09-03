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
    fetch('/bouncing-fruits-new.lottie')
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
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwTDEyNSAxMDBMMTI1IDE4NUwxNzUgMTM1TDE4NSAxMjVMMjc1IDEyNUwyNzUgMTg1TDE3NSAxNTBaIiBmaWxsPSIjQ0JEMkQ4Ci8+Cjwvc3ZnPgo=',
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const animationData = useLoadingAnimation();

  // Add minimum loading time to see animation
  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      if (isLoaded) {
        setShowAnimation(false);
      }
    }, 1500); // Show animation for at least 1.5 seconds

    return () => clearTimeout(minLoadingTime);
  }, [isLoaded]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (loading === 'lazy') {
      observer.observe(img);
      return () => observer.disconnect();
    } else {
      img.src = src;
    }
  }, [src, loading]);

  const handleImageLoad = () => {
    console.log('🖼️ Image loaded for:', alt);
    setIsLoaded(true);
    // Delay hiding animation to ensure users see it
    setTimeout(() => setShowAnimation(false), 800);
  };

  const handleImageError = () => {
    console.error('❌ Image failed to load for:', alt);
    
    // Try fallback image first
    const img = imgRef.current;
    if (img && img.src !== '/logo-placeholder.png' && !img.src.includes('logo-placeholder.png')) {
      img.src = '/logo-placeholder.png';
      return;
    }
    
    setHasError(true);
    setShowAnimation(false);
  };

  console.log('🎬 Animation data loaded:', !!animationData, 'Show animation:', showAnimation);

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
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-2xl animate-bounce">🍎</div>
            </div>
          )}
        </div>
      )}
      
      {/* Actual Image */}
      <img
        ref={imgRef}
        src={loading === 'eager' ? src : placeholder}
        alt={alt}
        className={`transition-opacity duration-500 ${
          isLoaded && !showAnimation ? 'opacity-100' : 'opacity-0'
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