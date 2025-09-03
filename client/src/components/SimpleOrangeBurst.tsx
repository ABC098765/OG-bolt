import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

interface SplashParticle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  targetCharIndex: number;
  charBounds: DOMRect;
  size: number;
  opacity: number;
  rotation: number;
}

interface CharacterState {
  char: string;
  painted: boolean;
  splashCount: number;
  opacity: number;
}

const SimpleOrangeBurst: React.FC = () => {
  // Text broken into individual characters
  const text = "SUPER FRUIT CENTER";
  const characters = text.split('').map((char, index) => ({
    char,
    index,
    painted: false,
    splashCount: 0,
    opacity: 0
  }));

  // Performance configuration per orange.md
  const PERFORMANCE_CONFIG = useMemo(() => ({
    maxActiveParticles: 30,        // Hard limit per orange.md
    particlePoolSize: 50,          // Pre-allocated particle pool
    cleanupThreshold: 0.05,        // Remove particles below this opacity
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    )
  }), []);

  // State management
  const [mounted, setMounted] = useState(false);
  const [orangeVisible, setOrangeVisible] = useState(false);
  const [orangePosition, setOrangePosition] = useState({ x: -100, y: 50 });
  const [orangeDirection, setOrangeDirection] = useState<'left' | 'right' | 'top'>('left');
  const [splashParticles, setSplashParticles] = useState<SplashParticle[]>([]);
  const [characterStates, setCharacterStates] = useState<CharacterState[]>(characters);
  const [animationStopped, setAnimationStopped] = useState(false);
  const [orangeCount, setOrangeCount] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animationFrameRef = useRef<number>();
  
  // Particle pool for memory efficiency
  const particlePoolRef = useRef<SplashParticle[]>([]);
  const activeParticleCount = useRef<number>(0);

  // Get random entry direction for orange
  const getRandomDirection = useCallback(() => {
    const directions: ('left' | 'right' | 'top')[] = ['left', 'right', 'top'];
    return directions[Math.floor(Math.random() * directions.length)];
  }, []);

  // Get starting position based on direction
  const getStartPosition = useCallback((direction: 'left' | 'right' | 'top') => {
    if (typeof window === 'undefined') return { x: -100, y: 50 };
    
    switch (direction) {
      case 'left':
        return { x: -100, y: 50 };
      case 'right':
        return { x: window.innerWidth + 100, y: 50 };
      case 'top':
        return { x: window.innerWidth / 2, y: -100 };
      default:
        return { x: -100, y: 50 };
    }
  }, []);

  // Create splash particles targeting random characters
  const createSplashParticles = useCallback(() => {
    if (typeof window === 'undefined') return [];
    
    const newParticles: SplashParticle[] = [];
    // Mobile optimization: reduce particle count
    const baseSplashCount = PERFORMANCE_CONFIG.isMobile ? 6 : 8;
    const maxSplashCount = PERFORMANCE_CONFIG.isMobile ? 10 : 15;
    const numSplashes = baseSplashCount + Math.floor(Math.random() * (maxSplashCount - baseSplashCount + 1));
    
    // Get available characters (not fully painted)
    const availableChars = characterStates
      .filter(char => char.char !== ' ' && char.splashCount < 3)
      .map((_, index) => index)
      .filter(index => characterStates[index].char !== ' ');

    if (availableChars.length === 0) return [];

    for (let i = 0; i < numSplashes; i++) {
      // Pick random character to target
      const targetIndex = availableChars[Math.floor(Math.random() * availableChars.length)];
      const charElement = characterRefs.current[targetIndex];
      
      if (charElement && containerRef.current) {
        try {
          const charBounds = charElement.getBoundingClientRect();
          const containerBounds = containerRef.current.getBoundingClientRect();
          
          // Enhanced splash particle creation with trajectory calculation
          const startX = window.innerWidth / 2;
          const startY = window.innerHeight / 2;
          const targetX = charBounds.left - containerBounds.left + (charBounds.width / 2);
          const targetY = charBounds.top - containerBounds.top + (charBounds.height / 2);
          
          // Calculate trajectory toward character center (orange.md mathematical approach)
          const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
          const timeToTarget = Math.max(30, distance / 8); // Minimum 30 frames to target
          
          // Enhanced initial velocity calculation for precise targeting
          const baseVelocityX = (targetX - startX) / timeToTarget;
          const baseVelocityY = (targetY - startY) / timeToTarget;
          
          // Add random variation for natural splash spread
          const velocityX = baseVelocityX + (Math.random() - 0.5) * 3;
          const velocityY = baseVelocityY + (Math.random() - 0.5) * 2 - 1; // Slight upward bias
          
          const particle: SplashParticle = {
            id: `splash-${Date.now()}-${i}`,
            x: startX,
            y: startY,
            velocityX,
            velocityY,
            targetCharIndex: targetIndex,
            charBounds: {
              ...charBounds,
              left: charBounds.left - containerBounds.left,
              top: charBounds.top - containerBounds.top,
              right: charBounds.right - containerBounds.left,
              bottom: charBounds.bottom - containerBounds.top,
              width: charBounds.width,
              height: charBounds.height
            } as DOMRect,
            size: 6 + Math.random() * 18, // Enhanced size variation (6-24px per orange.md)
            opacity: 0.85 + Math.random() * 0.15,
            rotation: Math.random() * 360
          };
          
          newParticles.push(particle);
        } catch (error) {
          console.warn('Error creating splash particle:', error);
        }
      }
    }
    
    return newParticles;
  }, [characterStates]);

  // Enhanced physics configuration per orange.md specifications
  const PHYSICS_CONFIG = useMemo(() => ({
    gravity: 0.2,              // pixels per frame² (mathematical approach)
    airResistance: 0.99,       // velocity damping coefficient  
    restitution: 0.3,          // bounce factor for boundary collisions
    maxVelocity: 15,           // maximum velocity limit for stability
    deltaTime: 1,              // frame time multiplier for consistent physics
  }), []);

  // Enhanced splash visual styles per orange.md
  const SPLASH_STYLES = useMemo(() => ({
    cartoonish: {
      borderRadius: '60% 40% 55% 65%',
      background: 'radial-gradient(ellipse at 30% 30%, rgba(255, 180, 71, 0.9) 0%, rgba(255, 140, 0, 0.8) 40%, rgba(255, 101, 24, 0.7) 80%, rgba(255, 69, 0, 0.6) 100%)',
      filter: 'drop-shadow(0 0 3px rgba(255, 140, 0, 0.4)) blur(0.2px)',
      transform: 'scale(1.1)'
    },
    realistic: {
      clipPath: 'ellipse(50% 60% at 40% 35%)',
      background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.9) 0%, rgba(255, 183, 71, 0.8) 30%, rgba(255, 117, 24, 0.7) 70%, rgba(255, 69, 0, 0.6) 100%)',
      filter: 'blur(0.3px) brightness(1.05) saturate(1.1)',
      transform: 'scale(0.95)'
    }
  }), []);

  // Particle pool management functions
  const getParticleFromPool = useCallback((): SplashParticle | null => {
    if (activeParticleCount.current >= PERFORMANCE_CONFIG.maxActiveParticles) {
      return null; // Respect particle limit
    }
    
    if (particlePoolRef.current.length > 0) {
      activeParticleCount.current++;
      return particlePoolRef.current.pop()!;
    }
    
    // Create new particle if pool is empty
    activeParticleCount.current++;
    return {
      id: `splash-${Date.now()}-${Math.random()}`,
      x: 0, y: 0, velocityX: 0, velocityY: 0,
      targetCharIndex: 0, charBounds: {} as DOMRect,
      size: 0, opacity: 0, rotation: 0
    };
  }, [PERFORMANCE_CONFIG.maxActiveParticles]);

  const recycleParticle = useCallback((particle: SplashParticle) => {
    // Reset particle properties for reuse
    particle.x = 0;
    particle.y = 0;
    particle.velocityX = 0;
    particle.velocityY = 0;
    particle.opacity = 1;
    particle.rotation = 0;
    
    particlePoolRef.current.push(particle);
    activeParticleCount.current = Math.max(0, activeParticleCount.current - 1);
  }, []);

  // Enhanced physics animation loop with precise timing
  const lastUpdateRef = useRef<number>(0);
  const animateSplashes = useCallback(() => {
    if (animationStopped) return;

    // Target 60fps with high-resolution timing
    const now = Date.now();
    if (now - lastUpdateRef.current < 16) { // 60fps = ~16ms per frame
      animationFrameRef.current = requestAnimationFrame(animateSplashes);
      return;
    }
    const deltaTime = Math.min((now - lastUpdateRef.current) / 16, 2); // Cap delta for stability
    lastUpdateRef.current = now;

    setSplashParticles(prevParticles => {
      if (prevParticles.length === 0) return prevParticles;
      
      const updatedParticles = prevParticles.map(particle => {
        // Enhanced physics calculations per orange.md mathematical approach
        let newVelocityX = particle.velocityX;
        let newVelocityY = particle.velocityY;
        
        // Apply gravity (constant downward acceleration)
        newVelocityY += PHYSICS_CONFIG.gravity * deltaTime;
        
        // Apply air resistance (velocity damping)
        newVelocityX *= PHYSICS_CONFIG.airResistance;
        newVelocityY *= PHYSICS_CONFIG.airResistance;
        
        // Clamp velocities to prevent instability
        newVelocityX = Math.max(-PHYSICS_CONFIG.maxVelocity, Math.min(PHYSICS_CONFIG.maxVelocity, newVelocityX));
        newVelocityY = Math.max(-PHYSICS_CONFIG.maxVelocity, Math.min(PHYSICS_CONFIG.maxVelocity, newVelocityY));
        
        // Update position using enhanced velocity calculations
        let newX = particle.x + newVelocityX * deltaTime;
        let newY = particle.y + newVelocityY * deltaTime;
        
        // Enhanced boundary constraint system
        const charBounds = particle.charBounds;
        const constraintPadding = 2; // Buffer for natural splash overflow
        
        // Horizontal boundary enforcement with bounce
        if (newX < charBounds.left - constraintPadding) {
          newX = charBounds.left - constraintPadding;
          newVelocityX *= -PHYSICS_CONFIG.restitution;
        } else if (newX > charBounds.right + constraintPadding) {
          newX = charBounds.right + constraintPadding;
          newVelocityX *= -PHYSICS_CONFIG.restitution;
        }
        
        // Vertical boundary enforcement (allow dripping to character bottom)
        if (newY < charBounds.top - constraintPadding) {
          newY = charBounds.top - constraintPadding;
          newVelocityY *= -PHYSICS_CONFIG.restitution;
        } else if (newY > charBounds.bottom + 10) {
          // Allow slight drip past character bottom for natural effect
          newY = charBounds.bottom + 10;
          newVelocityY = 0; // Stop dripping
        }
        
        // Enhanced character paint detection
        const withinCharBounds = (
          newX >= charBounds.left - 1 && 
          newX <= charBounds.right + 1 && 
          newY >= charBounds.top - 1 && 
          newY <= charBounds.bottom + 1
        );
        
        // Enhanced paint detection with progressive character painting
        if (withinCharBounds) {
          setCharacterStates(prevStates => {
            const newStates = [...prevStates];
            if (newStates[particle.targetCharIndex]) {
              // More precise paint accumulation
              const paintIncrement = 0.15; // Faster painting response
              newStates[particle.targetCharIndex].splashCount += paintIncrement;
              
              // Progressive opacity revelation based on splash count
              const splashCount = newStates[particle.targetCharIndex].splashCount;
              if (splashCount >= 0.5 && splashCount < 1.5) {
                // Partial paint state
                newStates[particle.targetCharIndex].opacity = splashCount / 1.5 * 0.6;
              } else if (splashCount >= 1.5) {
                // Full paint state
                newStates[particle.targetCharIndex].opacity = Math.min(splashCount / 2.5, 1);
                newStates[particle.targetCharIndex].painted = true;
              }
            }
            return newStates;
          });
        }
        
        return {
          ...particle,
          x: newX,
          y: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY,
          opacity: particle.opacity * 0.992, // Enhanced gradual fade
          rotation: particle.rotation + 1.5 // Continuous rotation for visual appeal
        };
      }).filter(particle => {
        if (typeof window === 'undefined') return false;
        
        // Enhanced particle cleanup with recycling
        const isVisible = particle.opacity > PERFORMANCE_CONFIG.cleanupThreshold;
        const isOnScreen = particle.y < window.innerHeight + 50;
        const withinBounds = particle.x > -50 && particle.x < window.innerWidth + 50;
        
        if (!isVisible || !isOnScreen || !withinBounds) {
          // Recycle particle back to pool
          recycleParticle(particle);
          return false;
        }
        
        return true;
      });

      return updatedParticles;
    });

    if (!animationStopped) {
      animationFrameRef.current = requestAnimationFrame(animateSplashes);
    }
  }, [animationStopped]);

  // Start splash animation
  useEffect(() => {
    if (splashParticles.length > 0 && !animationStopped) {
      // Clear any existing animation frame before starting new one
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animateSplashes);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [splashParticles, animateSplashes, animationStopped]);

  // Orange animation sequence
  const startOrangeAnimation = useCallback(() => {
    if (animationStopped) return;

    const direction = getRandomDirection();
    const startPos = getStartPosition(direction);
    
    setOrangeDirection(direction);
    setOrangePosition(startPos);
    setOrangeVisible(true);

    // Move orange to center
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        setOrangePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
    }, 100);

    // Burst and create splashes
    setTimeout(() => {
      setOrangeVisible(false);
      const newSplashes = createSplashParticles();
      setSplashParticles(prev => [...prev, ...newSplashes]);
      setOrangeCount(prev => prev + 1);
    }, 2000);

  }, [getRandomDirection, getStartPosition, createSplashParticles, animationStopped]);

  // Check if animation should stop (all characters painted)
  useEffect(() => {
    const allCharactersPainted = characterStates.every(char => 
      char.char === ' ' || char.painted
    );
    
    if (allCharactersPainted && !animationStopped) {
      setAnimationStopped(true);
      // Clear any remaining splashes after a delay
      setTimeout(() => {
        setSplashParticles([]);
      }, 2000);
    }
  }, [characterStates, animationStopped]);

  // Mount check for client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Start animation sequence
  useEffect(() => {
    if (!animationStopped && mounted) {
      const intervals: NodeJS.Timeout[] = [];
      
      // Schedule oranges at different intervals
      intervals.push(setTimeout(startOrangeAnimation, 1000));
      intervals.push(setTimeout(startOrangeAnimation, 6000));
      intervals.push(setTimeout(startOrangeAnimation, 11000));
      intervals.push(setTimeout(startOrangeAnimation, 16000));

      return () => {
        intervals.forEach(clearTimeout);
      };
    }
  }, [startOrangeAnimation, animationStopped, mounted]);

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="relative z-10 text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black leading-tight text-orange-300/20">
            SUPER FRUIT CENTER
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden"
    >
      
      {/* Orange Emoji */}
      {orangeVisible && (
        <div 
          className="absolute text-6xl z-30 transition-all duration-2000 ease-out"
          style={{
            left: orangePosition.x - 30,
            top: orangePosition.y - 30,
            transform: orangeVisible ? 'scale(1)' : 'scale(0)',
          }}
        >
          🍊
        </div>
      )}

      {/* Enhanced Splash Particles with Visual Styles */}
      {splashParticles.map((particle, index) => {
        // Choose visual style based on particle index for variety
        const useRealistic = index % 3 === 0;
        const visualStyle = useRealistic ? SPLASH_STYLES.realistic : SPLASH_STYLES.cartoonish;
        
        // Mobile performance: reduce visual effects
        const mobileOptimizedStyle = PERFORMANCE_CONFIG.isMobile ? {
          filter: 'none', // Remove complex filters on mobile
          transform: `rotate(${particle.rotation}deg) scale(${PERFORMANCE_CONFIG.isMobile ? 0.8 : 1})`
        } : {
          filter: visualStyle.filter,
          transform: `rotate(${particle.rotation}deg) ${visualStyle.transform}`
        };
        
        return (
          <div
            key={particle.id}
            className="absolute pointer-events-none z-20 transition-opacity duration-100"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              background: visualStyle.background,
              borderRadius: 'borderRadius' in visualStyle ? visualStyle.borderRadius : undefined,
              clipPath: 'clipPath' in visualStyle ? visualStyle.clipPath : undefined,
              opacity: particle.opacity,
              boxShadow: PERFORMANCE_CONFIG.isMobile 
                ? 'none' 
                : `0 0 ${particle.size * 0.3}px rgba(255, 140, 0, ${particle.opacity * 0.4})`,
              ...mobileOptimizedStyle
            }}
          />
        );
      })}
      
      {/* Text with Individual Character Spans */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black leading-tight">
          {characterStates.map((charState, index) => (
            <span
              key={index}
              ref={el => characterRefs.current[index] = el}
              className="inline-block transition-all duration-500"
              style={{
                opacity: charState.opacity,
                background: charState.painted 
                  ? `linear-gradient(45deg, rgba(255, 102, 0, 1) 0%, rgba(255, 149, 0, 1) 50%, rgba(255, 69, 0, 1) 100%)`
                  : 'transparent',
                WebkitBackgroundClip: charState.painted ? 'text' : 'unset',
                backgroundClip: charState.painted ? 'text' : 'unset',
                color: charState.painted ? 'transparent' : 'rgba(255, 140, 0, 0.1)',
                textShadow: charState.painted ? '0 0 20px rgba(255, 102, 0, 0.3)' : 'none',
                transform: charState.painted ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {charState.char === ' ' ? '\u00A0' : charState.char}
              {index === 10 && <br />} {/* Line break after "SUPER FRUIT" */}
            </span>
          ))}
        </h1>
      </div>
    </section>
  );
};

export default SimpleOrangeBurst;