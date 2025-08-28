import React, { useRef, useEffect, useState } from 'react';

const SimpleOrangeBurst: React.FC = () => {
  const [textVisible, setTextVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: waiting, 1: first orange moving, 2: first burst, 3: second orange moving, 4: second burst, 5: reset
  const [splashParticles, setSplashParticles] = useState<Array<{id: number, x: number, y: number, delay: number, targetX: number, targetY: number}>>([]);
  const [textRevealProgress, setTextRevealProgress] = useState(0);
  const orangeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const startAnimation = () => {
      // Wait 1 second, then start first orange movement
      timeoutId = setTimeout(() => {
        setAnimationPhase(1);
        
        // After 4 seconds of smooth forward movement, trigger first burst
        timeoutId = setTimeout(() => {
          setAnimationPhase(2);
          
          // Create first splash particles
          const particles: Array<{id: number, x: number, y: number, delay: number, targetX: number, targetY: number}> = [];
          const textElement = textRef.current;
          const textBounds = textElement ? textElement.getBoundingClientRect() : { width: 600, height: 200 };
          
          for (let i = 0; i < 15; i++) {
            const angle = (i * 24) * Math.PI / 180; // 15 particles in circle
            const initialDistance = 120 + Math.random() * 80;
            
            const targetX = (Math.random() - 0.5) * (textBounds.width * 0.8);
            const targetY = (Math.random() - 0.5) * (textBounds.height * 0.6);
            
            particles.push({
              id: i,
              x: Math.cos(angle) * initialDistance,
              y: Math.sin(angle) * initialDistance,
              targetX: targetX,
              targetY: targetY,
              delay: i * 50
            });
          }
          setSplashParticles(particles);
          
          // After 3 seconds, start second orange
          timeoutId = setTimeout(() => {
            setAnimationPhase(3);
            
            // After 4 seconds, trigger second burst
            timeoutId = setTimeout(() => {
              setAnimationPhase(4);
              
              // Create second batch of splash particles (keep first ones visible)
              const secondParticles: Array<{id: number, x: number, y: number, delay: number, targetX: number, targetY: number}> = [...particles]; // Keep existing particles
              
              for (let i = 15; i < 30; i++) {
                const angle = (i * 24) * Math.PI / 180;
                const initialDistance = 100 + Math.random() * 90;
                
                const targetX = (Math.random() - 0.5) * (textBounds.width * 0.9);
                const targetY = (Math.random() - 0.5) * (textBounds.height * 0.7);
                
                secondParticles.push({
                  id: i,
                  x: Math.cos(angle) * initialDistance,
                  y: Math.sin(angle) * initialDistance,
                  targetX: targetX,
                  targetY: targetY,
                  delay: (i - 15) * 45
                });
              }
              setSplashParticles(secondParticles);
              
              // Reset after 4 seconds
              timeoutId = setTimeout(() => {
                setAnimationPhase(0);
                setSplashParticles([]);
              }, 4000);
            }, 4000);
          }, 3000);
        }, 4000);
      }, 1000);
    };

    startAnimation();
    
    // Repeat the cycle every 16 seconds (longer cycle for two oranges)
    const intervalId = setInterval(startAnimation, 16000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

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
          // Handle both oranges
          width: (animationPhase === 0 || animationPhase === 3) ? '15px' :
                 (animationPhase === 1 || animationPhase === 4) ? '180px' :
                 '0px',
          height: (animationPhase === 0 || animationPhase === 3) ? '15px' :
                  (animationPhase === 1 || animationPhase === 4) ? '180px' :
                  '0px',
          transform: (animationPhase === 0 || animationPhase === 3) ? 'translate(-50%, -50%) scale(0.05) perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' :
                     (animationPhase === 1 || animationPhase === 4) ? 'translate(-50%, -50%) scale(1.0) perspective(1000px) rotateX(360deg) rotateY(720deg) rotateZ(180deg)' :
                     'translate(-50%, -50%) scale(0) perspective(1000px)',
          left: '50%',
          top: '50%',
          zIndex: 5,
          filter: (animationPhase === 0 || animationPhase === 3) ? 'blur(3px) brightness(0.5) saturate(0.7)' :
                  (animationPhase === 1 || animationPhase === 4) ? 'blur(0px) brightness(1.3) saturate(1.2)' :
                  'blur(0px) brightness(2) saturate(1.5)',
          opacity: (animationPhase === 2 || animationPhase === 4) ? 0 : 1,
        }}
      />

      {/* Paint Splash Effects */}
      {(animationPhase === 2 || animationPhase === 4) && splashParticles.map((particle, index) => {
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
            backgroundImage: 'none',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: 'none',
            WebkitTextStroke: 'none',
            animation: 'none',
          }}
        >
          SUPER FRUIT
          <br />
          <span 
            style={{
              backgroundImage: 'none',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: 'none',
              WebkitTextStroke: 'none',
              animation: 'none',
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