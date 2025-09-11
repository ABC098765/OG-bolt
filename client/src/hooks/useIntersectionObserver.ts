import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  observeNewElements?: boolean;
}

interface UseIntersectionObserverReturn {
  observeElement: (element: Element) => void;
  unobserveElement: (element: Element) => void;
  observeAllElements: () => void;
  disconnect: () => void;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    observeNewElements = true,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const observedElementsRef = useRef<Set<Element>>(new Set());
  const prefersReducedMotionRef = useRef<boolean>(false);

  // Check for reduced motion preference
  const checkReducedMotion = useCallback(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  // Reveal element immediately (for reduced motion)
  const revealElement = useCallback((element: Element) => {
    try {
      element.classList.add('revealed');
    } catch (error) {
      console.warn('Failed to reveal element:', error);
    }
  }, []);

  // Observe a single element
  const observeElement = useCallback((element: Element) => {
    if (!observerRef.current || observedElementsRef.current.has(element)) {
      return;
    }

    try {
      if (prefersReducedMotionRef.current) {
        revealElement(element);
      } else {
        observerRef.current.observe(element);
        observedElementsRef.current.add(element);
      }
    } catch (error) {
      console.warn('Failed to observe element:', error);
    }
  }, [revealElement]);

  // Unobserve a single element
  const unobserveElement = useCallback((element: Element) => {
    if (!observerRef.current || !observedElementsRef.current.has(element)) {
      return;
    }

    try {
      observerRef.current.unobserve(element);
      observedElementsRef.current.delete(element);
    } catch (error) {
      console.warn('Failed to unobserve element:', error);
    }
  }, []);

  // Observe all elements with reveal classes
  const observeAllElements = useCallback(() => {
    try {
      const elements = document.querySelectorAll('.reveal-section, .reveal-product');
      elements.forEach(observeElement);
    } catch (error) {
      console.warn('Failed to observe all elements:', error);
    }
  }, [observeElement]);

  // Disconnect all observers
  const disconnect = useCallback(() => {
    try {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observedElementsRef.current.clear();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    } catch (error) {
      console.warn('Failed to disconnect observers:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    checkReducedMotion();

    // Create intersection observer
    try {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            try {
              if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If triggerOnce is true, unobserve after revealing
                if (triggerOnce) {
                  unobserveElement(entry.target);
                }
              } else if (!triggerOnce) {
                // Only remove revealed class if triggerOnce is false
                entry.target.classList.remove('revealed');
              }
            } catch (error) {
              console.warn('Failed to handle intersection entry:', error);
            }
          });
        },
        {
          threshold,
          rootMargin,
        }
      );
    } catch (error) {
      console.error('Failed to create IntersectionObserver:', error);
      return;
    }

    // Create mutation observer to watch for new elements
    if (observeNewElements && !prefersReducedMotionRef.current) {
      try {
        mutationObserverRef.current = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                
                // Check if the added element has reveal classes
                if (element.classList.contains('reveal-section') || element.classList.contains('reveal-product')) {
                  observeElement(element);
                }
                
                // Check for reveal elements within the added node
                const revealElements = element.querySelectorAll('.reveal-section, .reveal-product');
                revealElements.forEach(observeElement);
              }
            });
          });
        });

        mutationObserverRef.current.observe(document.body, {
          childList: true,
          subtree: true,
        });
      } catch (error) {
        console.warn('Failed to create MutationObserver:', error);
      }
    }

    // Initial observation of existing elements
    observeAllElements();

    // Listen for reduced motion changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches) {
        // If reduced motion is now preferred, reveal all elements immediately
        const elements = document.querySelectorAll('.reveal-section, .reveal-product');
        elements.forEach(revealElement);
        disconnect();
      }
    };

    try {
      mediaQuery.addEventListener('change', handleMediaChange);
    } catch (error) {
      // Fallback for older browsers
      try {
        mediaQuery.addListener(handleMediaChange);
      } catch (fallbackError) {
        console.warn('Failed to listen for media query changes:', fallbackError);
      }
    }

    // Cleanup function
    return () => {
      disconnect();
      try {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } catch (error) {
        try {
          mediaQuery.removeListener(handleMediaChange);
        } catch (fallbackError) {
          // Silent fail for cleanup
        }
      }
    };
  }, [threshold, rootMargin, triggerOnce, observeNewElements, observeAllElements, unobserveElement, disconnect, revealElement, checkReducedMotion]);

  return {
    observeElement,
    unobserveElement,
    observeAllElements,
    disconnect,
  };
};