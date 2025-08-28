import React, { useRef, useEffect, useState } from 'react';

const SimpleOrangeBurst: React.FC = () => {
  const [textVisible, setTextVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: waiting, 1-8: oranges moving/bursting in sequence
  const [currentOrangeDirection, setCurrentOrangeDirection] = useState({ startX: '50%', startY: '50%', direction: 'center' });
  const [splashParticles, setSplashParticles] = useState<Array<{id: number, x: number, y: number, delay: number, targetX: number, targetY: number}>>([]);
  const [textRevealProgress, setTextRevealProgress] = useState(0);
  const [isTextColored, setIsTextColored] = useState(false);
  const [stopAnimation, setStopAnimation] = useState(false);
  const orangeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const startAnimation = () => {
      // Function to get random starting position
      const getRandomDirection = () => {
        const directions = [
          { startX: '50%', startY: '50%', direction: 'center' }, // from behind (original)
          { startX: '-10%', startY: '50%', direction: 'left' }, // from left side
          { startX: '110%', startY: '50%', direction: 'right' }, // from right side
          { startX: '50%', startY: '-10%', direction: 'top' }, // from top
          { startX: '20%', startY: '-10%', direction: 'top-left' }, // from top-left
          { startX: '80%', startY: '-10%', direction: 'top-right' }, // from top-right
        ];
        return directions[Math.floor(Math.random() * directions.length)];
      };
      
      const createOrangeSequence = (orangeNumber: number, delay: number) => {
        setTimeout(() => {
          // Don't create more oranges if animation should stop
          if (stopAnimation || isTextColored) return;
          
          // Set random direction for this orange
          setCurrentOrangeDirection(getRandomDirection());
          setAnimationPhase(orangeNumber * 2 - 1); // odd numbers: 1, 3, 5, 7 for movement
          
          // After 3 seconds of movement, trigger burst
          setTimeout(() => {
            // Don't continue with burst if animation should stop
            if (stopAnimation || isTextColored) return;
            
            setAnimationPhase(orangeNumber * 2); // even numbers: 2, 4, 6, 8 for burst
            
            // Create splash particles for this orange
            setSplashParticles(prevParticles => {
              // Limit total particles to prevent memory issues
              const maxParticles = 60;
              let newParticles = [...prevParticles];
              
              // Remove oldest particles if we're at the limit
              if (newParticles.length >= maxParticles) {
                newParticles = newParticles.slice(-30); // Keep only the 30 most recent
              }
              
              const textElement = textRef.current;
              const textBounds = textElement ? textElement.getBoundingClientRect() : { width: 600, height: 200 };
              
              // Generate truly unique IDs using timestamp and orange number
              const uniqueId = Date.now() * 1000 + orangeNumber * 100;
              for (let i = 0; i < 15; i++) {
                // Completely random direction and distance for natural splashing
                const randomAngle = Math.random() * 2 * Math.PI; // Random angle 0-360 degrees
                const randomDistance = 80 + Math.random() * 150; // Random distance 80-230px
                
                // Random target positions across the text area
                const targetX = (Math.random() - 0.5) * (textBounds.width * 1.2);
                const targetY = (Math.random() - 0.5) * (textBounds.height * 1.0);
                
                newParticles.push({
                  id: `${uniqueId}_${i}_${Math.random().toString(36).substr(2, 9)}`, // Completely unique string ID
                  x: Math.cos(randomAngle) * randomDistance,
                  y: Math.sin(randomAngle) * randomDistance,
                  targetX: targetX,
                  targetY: targetY,
                  delay: Math.random() * 200 // Random delay 0-200ms
                });
              }
              return newParticles;
            });
            
            // Check if we have enough splashes to start text coloring after a delay
            setTimeout(() => {
              if (orangeNumber >= 3 && !isTextColored) { // After 3rd orange
                setIsTextColored(true);
                setTextVisible(true);
                setStopAnimation(true); // Stop animation immediately when text coloring starts
                
                // Start text reveal animation
                let progress = 0;
                const revealInterval = setInterval(() => {
                  progress += 8; // Faster reveal
                  setTextRevealProgress(progress);
                  if (progress >= 100) {
                    clearInterval(revealInterval);
                    
                    // After text is fully revealed, clear everything
                    setTimeout(() => {
                      setSplashParticles([]); // Clear all splashes immediately
                    }, 1000);
                  }
                }, 60);
              }
            }, 500);
            
            // Reset this orange after 2.5 seconds, but keep splashes
            setTimeout(() => {
              setAnimationPhase(0);
            }, 2500);
          }, 3000);
        }, delay);
      };
      
      // Create sequence of 5 oranges with random delays
      createOrangeSequence(1, 1000); // First orange after 1s
      createOrangeSequence(2, 5000); // Second orange after 5s
      createOrangeSequence(3, 9000); // Third orange after 9s
      createOrangeSequence(4, 13000); // Fourth orange after 13s
      createOrangeSequence(5, 17000); // Fifth orange after 17s
    };

    if (!stopAnimation) {
      startAnimation();
      
      // Repeat the cycle every 25 seconds (longer cycle for multiple oranges)
      const intervalId = setInterval(() => {
        if (!stopAnimation) {
          startAnimation();
        }
      }, 25000);
      
      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
      };
    }
  }, [stopAnimation, isTextColored]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      
      {/* 3D Orange */}
      <div 
        ref={orangeRef}
        className="absolute rounded-full"
        style={{
          transition: animationPhase === 0 ? 'all 1s ease-in-out' :
                     animationPhase === 1 ? 'all 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' :
                     'all 0.8s ease-out',
          background: 'radial-gradient(circle at 30% 30%, #ffb347, #ff8c00, #ff6600)',
          boxShadow: animationPhase === 0 ? '0 0 10px rgba(255, 102, 0, 0.3)' :
                     animationPhase === 1 ? '0 0 80px #ff6600, 0 0 120px rgba(255, 102, 0, 0.4), inset -15px -15px 30px rgba(0,0,0,0.3)' :
                     '0 0 200px #ff6600',
          // Handle multiple oranges from random directions
          width: (animationPhase % 2 === 1) ? '180px' :
                 (animationPhase === 0) ? '15px' : '0px',
          height: (animationPhase % 2 === 1) ? '180px' :
                  (animationPhase === 0) ? '15px' : '0px',
          transform: (animationPhase === 0) ? 'translate(-50%, -50%) scale(0.05) perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' :
                     (animationPhase % 2 === 1) ? 'translate(-50%, -50%) scale(1.0) perspective(1000px) rotateX(360deg) rotateY(720deg) rotateZ(180deg)' :
                     'translate(-50%, -50%) scale(0) perspective(1000px)',
          left: (animationPhase === 0) ? currentOrangeDirection.startX : '50%',
          top: (animationPhase === 0) ? currentOrangeDirection.startY : '50%',
          zIndex: 5,
          filter: (animationPhase === 0) ? 'blur(3px) brightness(0.5) saturate(0.7)' :
                  (animationPhase % 2 === 1) ? 'blur(0px) brightness(1.3) saturate(1.2)' :
                  'blur(0px) brightness(2) saturate(1.5)',
          opacity: (animationPhase % 2 === 0 && animationPhase > 0) ? 0 : 1,
        }}
      />

      {/* Paint Splash Effects */}
      {splashParticles.map((particle, index) => {
        // All particles are orange colored now
        const baseColor = '#ff6600';
        const secondColor = '#ff8800';
        
        // Create irregular paint splatter shapes
        const splatSize = 25 + Math.random() * 45; // Random size between 25-70px
        const borderRadius = `${Math.random() * 60 + 20}% ${Math.random() * 60 + 20}% ${Math.random() * 60 + 20}% ${Math.random() * 60 + 20}% / ${Math.random() * 60 + 20}% ${Math.random() * 60 + 20}% ${Math.random() * 60 + 20}% ${Math.random() * 60 + 20}%`;
        
        return (
          <div
            key={particle.id}
            className="absolute"
            style={{
              width: `${splatSize}px`,
              height: `${splatSize * (0.6 + Math.random() * 0.8)}px`, // Irregular height
              background: `radial-gradient(ellipse at ${20 + Math.random() * 60}% ${20 + Math.random() * 60}%, ${baseColor}ee, ${secondColor}cc, ${baseColor}77)`,
              borderRadius: borderRadius,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px) rotate(${Math.random() * 360}deg)`,
              transition: `all ${1200 + particle.delay}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              animationDelay: `${particle.delay}ms`,
              opacity: 0.75 + Math.random() * 0.25,
              zIndex: 15,
              boxShadow: `0 2px 8px ${baseColor}60, inset -3px -3px 6px rgba(0,0,0,0.2)`,
              filter: 'blur(0.8px) saturate(1.3)',
              animation: `paintSplatter 2.5s ease-out ${particle.delay}ms forwards`,
              animationFillMode: 'forwards',
              // CSS custom properties for particle targeting
              ...({
                '--target-x': `${particle.targetX}px`,
                '--target-y': `${particle.targetY}px`,
              } as any),
            }}
          >
            {/* Add paint drips for realism */}
            <div 
              className="absolute"
              style={{
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 20 + 8}px`,
                background: `linear-gradient(to bottom, ${baseColor}aa, ${secondColor}dd)`,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                bottom: `-${Math.random() * 10 + 8}px`,
                left: `${Math.random() * 60 + 20}%`,
                opacity: 0.8,
                transform: `rotate(${Math.random() * 30 - 15}deg)`,
              }}
            />
            {/* Additional smaller drip */}
            {Math.random() > 0.5 && (
              <div 
                className="absolute"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 12 + 5}px`,
                  background: secondColor,
                  borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
                  bottom: `-${Math.random() * 6 + 4}px`,
                  right: `${Math.random() * 40 + 30}%`,
                  opacity: 0.6,
                }}
              />
            )}
          </div>
        );
      })}
      
      {/* Text That Gets Colored by Splash */}
      <div ref={textRef} className="relative z-20 text-center">
        <h1 
          className="text-6xl sm:text-7xl lg:text-9xl font-black transition-all duration-2000"
          style={{
            backgroundImage: textVisible && textRevealProgress > 0
              ? `linear-gradient(45deg, 
                  rgba(255, 102, 0, ${Math.min(textRevealProgress / 100, 1)}) 0%, 
                  rgba(255, 149, 0, ${Math.min(textRevealProgress / 100, 1)}) 25%, 
                  rgba(255, 184, 0, ${Math.min(textRevealProgress / 100, 1)}) 50%, 
                  rgba(255, 102, 0, ${Math.min(textRevealProgress / 100, 1)}) 75%)`
              : 'none',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: textVisible && textRevealProgress > 0 ? 'transparent' : 'transparent',
            textShadow: textVisible && textRevealProgress > 50 
              ? `0 0 30px rgba(255, 102, 0, ${textRevealProgress / 200})` 
              : 'none',
            WebkitTextStroke: 'none',
            animation: textVisible && textRevealProgress > 80 
              ? 'gradientShift 3s ease-in-out infinite' 
              : 'none',
          }}
        >
          SUPER FRUIT
          <br />
          <span 
            style={{
              backgroundImage: textVisible && textRevealProgress > 20
                ? `linear-gradient(45deg, 
                    rgba(255, 102, 0, ${Math.min((textRevealProgress - 20) / 80, 1)}) 0%, 
                    rgba(255, 149, 0, ${Math.min((textRevealProgress - 20) / 80, 1)}) 33%, 
                    rgba(255, 184, 0, ${Math.min((textRevealProgress - 20) / 80, 1)}) 66%, 
                    rgba(255, 102, 0, ${Math.min((textRevealProgress - 20) / 80, 1)}) 100%)`
                : 'none',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: textVisible && textRevealProgress > 20 ? 'transparent' : 'transparent',
              textShadow: textVisible && textRevealProgress > 70 
                ? `0 0 30px rgba(255, 102, 0, ${(textRevealProgress - 20) / 160})` 
                : 'none',
              WebkitTextStroke: 'none',
              animation: textVisible && textRevealProgress > 80 
                ? 'gradientShift 3s ease-in-out infinite' 
                : 'none',
            }}
          >
            CENTER
          </span>
        </h1>
      </div>
    </section>
  );
};

export default SimpleOrangeBurst;