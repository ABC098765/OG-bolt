import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

interface SplashParticle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  targetCharIndex: number;
  size: number;
  opacity: number;
  rotation: number;
  color: string;
  trail: { x: number; y: number; opacity: number }[];
}

interface CharacterState {
  char: string;
  painted: boolean;
  splashCount: number;
  opacity: number;
  glowIntensity: number;
}

const SimpleOrangeBurst: React.FC = () => {
  const text = "SUPER FRUIT CENTER";
  const characters = text.split('').map((char, index) => ({
    char,
    index,
    painted: false,
    splashCount: 0,
    opacity: 0,
    glowIntensity: 0
  }));

  // Enhanced performance config
  const PERFORMANCE_CONFIG = useMemo(() => ({
    maxActiveParticles: 40,
    particleSpeed: 12,
    animationDuration: 8000,
    burstInterval: 1500,
    trailLength: 8,
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof navigator !== 'undefined' ? navigator.userAgent : ''
    )
  }), []);

  // State management
  const [mounted, setMounted] = useState(false);
  const [orangeVisible, setOrangeVisible] = useState(false);
  const [orangePosition, setOrangePosition] = useState({ x: 0, y: 0 });
  const [orangeScale, setOrangeScale] = useState(1);
  const [orangeRotation, setOrangeRotation] = useState(0);
  const [splashParticles, setSplashParticles] = useState<SplashParticle[]>([]);
  const [characterStates, setCharacterStates] = useState<CharacterState[]>(characters);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'entering' | 'exploding' | 'revealing'>('idle');
  const [screenShake, setScreenShake] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animationFrameRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);

  // Enhanced orange entry animation
  const startOrangeAnimation = useCallback(() => {
    if (!containerRef.current) return;

    setAnimationPhase('entering');
    setOrangeVisible(true);
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Start from random edge with dynamic entry
    const entryDirections = [
      { x: -200, y: centerY, targetX: centerX, targetY: centerY },
      { x: window.innerWidth + 200, y: centerY, targetX: centerX, targetY: centerY },
      { x: centerX, y: -200, targetX: centerX, targetY: centerY },
      { x: centerX, y: window.innerHeight + 200, targetX: centerX, targetY: centerY }
    ];
    
    const entry = entryDirections[Math.floor(Math.random() * entryDirections.length)];
    setOrangePosition({ x: entry.x, y: entry.y });

    // Animate orange to center with bounce and rotation
    const startTime = Date.now();
    const duration = 1500;

    const animateEntry = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for bouncy effect
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const bounce = 1 + Math.sin(progress * Math.PI * 4) * 0.1 * (1 - progress);
      
      const currentX = entry.x + (entry.targetX - entry.x) * easeOut;
      const currentY = entry.y + (entry.targetY - entry.y) * easeOut;
      
      setOrangePosition({ x: currentX, y: currentY });
      setOrangeScale(bounce);
      setOrangeRotation(progress * 720); // 2 full rotations
      
      if (progress < 1) {
        requestAnimationFrame(animateEntry);
      } else {
        // Start explosion after a brief pause
        setTimeout(() => {
          setAnimationPhase('exploding');
          explodeOrange();
        }, 300);
      }
    };
    
    requestAnimationFrame(animateEntry);
  }, []);

  // Enhanced explosion with screen shake and particle burst
  const explodeOrange = useCallback(() => {
    if (!containerRef.current) return;

    // Screen shake effect
    setScreenShake(20);
    setTimeout(() => setScreenShake(0), 300);

    // Hide orange with explosion scale
    setOrangeVisible(false);
    
    // Create enhanced splash particles
    const newParticles: SplashParticle[] = [];
    const particleCount = PERFORMANCE_CONFIG.isMobile ? 30 : 50;
    
    // Available target characters
    const availableChars = characterStates
      .map((_, index) => index)
      .filter(index => characterStates[index].char !== ' ');

    for (let i = 0; i < particleCount; i++) {
      if (availableChars.length === 0) break;
      
      const targetIndex = availableChars[Math.floor(Math.random() * availableChars.length)];
      const charElement = characterRefs.current[targetIndex];
      
      if (charElement && containerRef.current) {
        const charBounds = charElement.getBoundingClientRect();
        const containerBounds = containerRef.current.getBoundingClientRect();
        
        // Calculate trajectory with some spread
        const targetX = charBounds.left - containerBounds.left + (charBounds.width / 2);
        const targetY = charBounds.top - containerBounds.top + (charBounds.height / 2);
        
        const spread = 100;
        const finalTargetX = targetX + (Math.random() - 0.5) * spread;
        const finalTargetY = targetY + (Math.random() - 0.5) * spread;
        
        // Random initial direction with arc
        const angle = (Math.random() * Math.PI * 2);
        const speed = PERFORMANCE_CONFIG.particleSpeed + Math.random() * 8;
        
        newParticles.push({
          id: `particle-${i}`,
          x: orangePosition.x,
          y: orangePosition.y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          targetCharIndex: targetIndex,
          size: 8 + Math.random() * 12,
          opacity: 1,
          rotation: Math.random() * 360,
          color: `hsl(${20 + Math.random() * 30}, ${80 + Math.random() * 20}%, ${50 + Math.random() * 30}%)`,
          trail: []
        });
      }
    }
    
    setSplashParticles(newParticles);
    setAnimationPhase('revealing');
    
    // Start particle animation
    animateParticles();
  }, [orangePosition, characterStates, PERFORMANCE_CONFIG]);

  // Enhanced particle animation with trails and physics
  const animateParticles = useCallback(() => {
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime.current;
      lastFrameTime.current = currentTime;
      
      setSplashParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Update trail
          const newTrail = [
            { x: particle.x, y: particle.y, opacity: particle.opacity },
            ...particle.trail.slice(0, PERFORMANCE_CONFIG.trailLength - 1)
          ].map((point, index) => ({
            ...point,
            opacity: point.opacity * (1 - index / PERFORMANCE_CONFIG.trailLength)
          }));

          // Apply gravity and arc motion
          const gravity = 0.2;
          const drag = 0.99;
          
          particle.velocityY += gravity;
          particle.velocityX *= drag;
          particle.velocityY *= drag;
          
          // Update position
          particle.x += particle.velocityX;
          particle.y += particle.velocityY;
          particle.rotation += 5;
          
          // Check collision with target character
          const charElement = characterRefs.current[particle.targetCharIndex];
          if (charElement && containerRef.current) {
            const charBounds = charElement.getBoundingClientRect();
            const containerBounds = containerRef.current.getBoundingClientRect();
            
            const charCenterX = charBounds.left - containerBounds.left + (charBounds.width / 2);
            const charCenterY = charBounds.top - containerBounds.top + (charBounds.height / 2);
            
            const distance = Math.sqrt(
              Math.pow(particle.x - charCenterX, 2) + 
              Math.pow(particle.y - charCenterY, 2)
            );
            
            if (distance < 30) {
              // Hit character - start painting
              setCharacterStates(prev => {
                const newStates = [...prev];
                if (newStates[particle.targetCharIndex]) {
                  newStates[particle.targetCharIndex].painted = true;
                  newStates[particle.targetCharIndex].opacity = Math.min(1, 
                    newStates[particle.targetCharIndex].opacity + 0.2);
                  newStates[particle.targetCharIndex].glowIntensity = 1;
                  newStates[particle.targetCharIndex].splashCount += 1;
                }
                return newStates;
              });
              
              particle.opacity = 0; // Remove particle
            }
          }
          
          // Fade out over time
          particle.opacity -= 0.01;
          
          return {
            ...particle,
            trail: newTrail
          };
        }).filter(particle => particle.opacity > 0);
      });
      
      // Continue animation if particles exist
      setTimeout(() => {
        setSplashParticles(current => {
          if (current.length > 0) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
          return current;
        });
      }, 16); // ~60fps
    };
    
    lastFrameTime.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [PERFORMANCE_CONFIG]);

  // Glow decay animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCharacterStates(prev => prev.map(char => ({
        ...char,
        glowIntensity: Math.max(0, char.glowIntensity - 0.02)
      })));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-start animation sequence
  useEffect(() => {
    setMounted(true);
    
    const startSequence = () => {
      // Reset everything
      setCharacterStates(characters);
      setSplashParticles([]);
      setAnimationPhase('idle');
      
      // Start after delay
      setTimeout(startOrangeAnimation, 1000);
    };

    startSequence();
    
    // Repeat animation every 12 seconds
    const interval = setInterval(startSequence, 12000);
    
    return () => {
      clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startOrangeAnimation]);

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-6xl font-black text-orange-500 animate-pulse">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden"
      style={{
        transform: screenShake > 0 ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none',
        transition: screenShake > 0 ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Enhanced Orange with glow and rotation */}
      {orangeVisible && (
        <div 
          className="absolute text-8xl z-30 transition-all duration-300 ease-out"
          style={{
            left: orangePosition.x - 40,
            top: orangePosition.y - 40,
            transform: `scale(${orangeScale}) rotate(${orangeRotation}deg)`,
            filter: `drop-shadow(0 0 30px rgba(255, 140, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 140, 0, 0.4))`,
            animation: animationPhase === 'entering' ? 'pulse 0.5s infinite alternate' : 'none'
          }}
        >
          🍊
        </div>
      )}

      {/* Enhanced Splash Particles with trails */}
      {splashParticles.map((particle) => (
        <div key={particle.id}>
          {/* Particle trail */}
          {particle.trail.map((trailPoint, index) => (
            <div
              key={`${particle.id}-trail-${index}`}
              className="absolute pointer-events-none z-20 rounded-full"
              style={{
                left: trailPoint.x - particle.size / 4,
                top: trailPoint.y - particle.size / 4,
                width: particle.size / 2,
                height: particle.size / 2,
                background: particle.color,
                opacity: trailPoint.opacity * 0.6,
                filter: 'blur(2px)'
              }}
            />
          ))}
          
          {/* Main particle */}
          <div
            className="absolute pointer-events-none z-20 rounded-full"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, ${particle.color}, ${particle.color}dd)`,
              opacity: particle.opacity,
              transform: `rotate(${particle.rotation}deg)`,
              filter: `drop-shadow(0 0 ${particle.size}px ${particle.color}) blur(1px)`,
              animation: 'sparkle 0.1s infinite alternate'
            }}
          />
        </div>
      ))}
      
      {/* Enhanced Text with Dynamic Effects */}
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
                  ? `linear-gradient(45deg, 
                      hsl(20, 90%, 50%) 0%, 
                      hsl(30, 100%, 60%) 30%,
                      hsl(15, 95%, 45%) 70%,
                      hsl(35, 100%, 55%) 100%)`
                  : 'transparent',
                WebkitBackgroundClip: charState.painted ? 'text' : 'unset',
                backgroundClip: charState.painted ? 'text' : 'unset',
                color: charState.painted ? 'transparent' : 'rgba(255, 140, 0, 0.1)',
                textShadow: charState.painted && charState.glowIntensity > 0
                  ? `0 0 ${20 * charState.glowIntensity}px rgba(255, 102, 0, ${charState.glowIntensity * 0.8}),
                     0 0 ${40 * charState.glowIntensity}px rgba(255, 140, 0, ${charState.glowIntensity * 0.4})`
                  : 'none',
                transform: `scale(${charState.painted ? 1.02 + charState.glowIntensity * 0.05 : 1})`,
                filter: charState.painted && charState.glowIntensity > 0 
                  ? `brightness(${1 + charState.glowIntensity * 0.3})`
                  : 'none'
              }}
            >
              {charState.char === ' ' ? '\u00A0' : charState.char}
              {index === 10 && <br />}
            </span>
          ))}
        </h1>
      </div>

      <style>{`
        @keyframes sparkle {
          0% { filter: brightness(1) drop-shadow(0 0 10px currentColor); }
          100% { filter: brightness(1.5) drop-shadow(0 0 20px currentColor); }
        }
        
        @keyframes pulse {
          0% { filter: drop-shadow(0 0 20px rgba(255, 140, 0, 0.6)); }
          100% { filter: drop-shadow(0 0 40px rgba(255, 140, 0, 1)); }
        }
      `}</style>
    </section>
  );
};

export default SimpleOrangeBurst;