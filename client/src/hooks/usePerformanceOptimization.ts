import { useEffect, useCallback, useRef } from 'react';

// Hook for debouncing expensive operations
export const useDebounce = <T extends any[]>(
  callback: (...args: T) => void, 
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Hook for throttling high-frequency operations
export const useThrottle = <T extends any[]>(
  callback: (...args: T) => void, 
  limit: number
) => {
  const inThrottle = useRef(false);
  
  return useCallback((...args: T) => {
    if (!inThrottle.current) {
      callback(...args);
      inThrottle.current = true;
      setTimeout(() => {
        inThrottle.current = false;
      }, limit);
    }
  }, [callback, limit]);
};

// Hook for intersection observer (lazy loading)
export const useIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      callback(entry);
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [callback, options]);

  return elementRef;
};

// Hook for cleanup on unmount
export const useCleanup = (cleanupFn: () => void) => {
  useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};