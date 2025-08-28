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

  // State management
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

  // Get random entry direction for orange
  const getRandomDirection = useCallback(() => {
    const directions: ('left' | 'right' | 'top')[] = ['left', 'right', 'top'];
    return directions[Math.floor(Math.random() * directions.length)];
  }, []);

  // Get starting position based on direction
  const getStartPosition = useCallback((direction: 'left' | 'right' | 'top') => {
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
    const newParticles: SplashParticle[] = [];
    const numSplashes = 8 + Math.floor(Math.random() * 7); // 8-15 splashes
    
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
      
      if (charElement) {
        const charBounds = charElement.getBoundingClientRect();
        const containerBounds = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        
        // Create splash particle
        const particle: SplashParticle = {
          id: `splash-${Date.now()}-${i}`,
          x: window.innerWidth / 2, // Start from orange position
          y: window.innerHeight / 2,
          velocityX: (Math.random() - 0.5) * 8, // Random horizontal velocity
          velocityY: Math.random() * -3, // Initial upward velocity
          targetCharIndex: targetIndex,
          charBounds: {
            ...charBounds,
            left: charBounds.left - containerBounds.left,
            top: charBounds.top - containerBounds.top,
            right: charBounds.right - containerBounds.left,
            bottom: charBounds.bottom - containerBounds.top,
          } as DOMRect,
          size: 8 + Math.random() * 12, // Random size 8-20px
          opacity: 0.8 + Math.random() * 0.2,
          rotation: Math.random() * 360
        };
        
        newParticles.push(particle);
      }
    }
    
    return newParticles;
  }, [characterStates]);

  // Optimized physics animation loop with throttling
  const lastUpdateRef = useRef<number>(0);
  const animateSplashes = useCallback(() => {
    if (animationStopped) return;

    // Throttle animation to every 2nd frame for performance
    const now = Date.now();
    if (now - lastUpdateRef.current < 32) { // ~30fps instead of 60fps
      animationFrameRef.current = requestAnimationFrame(animateSplashes);
      return;
    }
    lastUpdateRef.current = now;

    setSplashParticles(prevParticles => {
      if (prevParticles.length === 0) return prevParticles;
      
      const updatedParticles = prevParticles.map(particle => {
        // Apply gravity and physics
        const gravity = 0.2; // Reduced gravity for performance
        const airResistance = 0.99; // Simplified resistance
        
        const newVelocityY = particle.velocityY + gravity;
        const newVelocityX = particle.velocityX * airResistance;
        
        let newX = particle.x + newVelocityX;
        let newY = particle.y + newVelocityY;
        
        // Check if splash is within target character bounds
        const charBounds = particle.charBounds;
        const withinCharBounds = (
          newX >= charBounds.left && 
          newX <= charBounds.right && 
          newY >= charBounds.top && 
          newY <= charBounds.bottom
        );
        
        // If splash hits character, mark it as painted
        if (withinCharBounds || (newY >= charBounds.top && newY <= charBounds.bottom && 
                                newX >= charBounds.left - 10 && newX <= charBounds.right + 10)) {
          // Update character paint state
          setCharacterStates(prevStates => {
            const newStates = [...prevStates];
            if (newStates[particle.targetCharIndex]) {
              newStates[particle.targetCharIndex].splashCount += 0.1;
              newStates[particle.targetCharIndex].opacity = Math.min(
                newStates[particle.targetCharIndex].splashCount / 2, 1
              );
              if (newStates[particle.targetCharIndex].splashCount >= 1.5) {
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
          opacity: particle.opacity * 0.995 // Gradual fade
        };
      }).filter(particle => 
        particle.opacity > 0.1 && 
        particle.y < window.innerHeight + 100 &&
        particle.x > -100 && particle.x < window.innerWidth + 100
      );

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
      setOrangePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
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

  // Start animation sequence
  useEffect(() => {
    if (!animationStopped) {
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
  }, [startOrangeAnimation, animationStopped]);

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

      {/* Splash Particles */}
      {splashParticles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none z-20"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, rgba(255, 140, 0, ${particle.opacity}) 0%, rgba(255, 165, 0, ${particle.opacity * 0.8}) 60%, rgba(255, 69, 0, ${particle.opacity * 0.6}) 100%)`,
            borderRadius: `${50 + Math.sin(particle.rotation) * 30}% ${50 + Math.cos(particle.rotation) * 25}%`,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size / 2}px rgba(255, 140, 0, ${particle.opacity * 0.5})`,
          }}
        />
      ))}
      
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