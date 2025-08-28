import React, { useRef, useEffect, useState } from 'react';

const SimpleOrangeBurst: React.FC = () => {
  const [textVisible, setTextVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: waiting, 1: orange moving, 2: burst, 3: reset
  const [splashParticles, setSplashParticles] = useState<Array<{id: number, x: number, y: number, delay: number, targetX: number, targetY: number}>>([]);
  const [textRevealProgress, setTextRevealProgress] = useState(0);
  const orangeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const startAnimation = () => {
      // Wait 1 second, then start orange movement from back
      timeoutId = setTimeout(() => {
        setAnimationPhase(1);
        
        // After 4 seconds of smooth forward movement, trigger burst
        timeoutId = setTimeout(() => {
          setAnimationPhase(2);
          
          // Create splash particles that target text areas
          const particles = [];
          // Get text element dimensions for targeting
          const textElement = textRef.current;
          const textBounds = textElement ? textElement.getBoundingClientRect() : { width: 600, height: 200 };
          
          for (let i = 0; i < 20; i++) {
            const angle = (i * 18) * Math.PI / 180; // 20 particles in circle
            const initialDistance = 120 + Math.random() * 80;
            
            // Target different areas of the text
            const targetX = (Math.random() - 0.5) * (textBounds.width * 0.8);
            const targetY = (Math.random() - 0.5) * (textBounds.height * 0.6);
            
            particles.push({
              id: i,
              x: Math.cos(angle) * initialDistance,
              y: Math.sin(angle) * initialDistance,
              targetX: targetX,
              targetY: targetY,
              delay: i * 40 // Faster staggered timing
            });
          }
          setSplashParticles(particles);
          
          // Start text reveal animation synchronized with particle movement
          setTimeout(() => {
            setTextVisible(true);
            // Gradually reveal text over 1.5 seconds, synchronized with particles
            let progress = 0;
            const revealInterval = setInterval(() => {
              progress += 8; // Faster reveal for better sync
              setTextRevealProgress(progress);
              if (progress >= 100) {
                clearInterval(revealInterval);
              }
            }, 40); // Smoother animation steps
          }, 300); // Earlier start for better synchronization
          
          // Reset after 4 seconds
          timeoutId = setTimeout(() => {
            setAnimationPhase(0);
            setTextVisible(false);
            setTextRevealProgress(0);
            setSplashParticles([]);
          }, 4000);
        }, 4000);
      }, 1000);
    };

    startAnimation();
    
    // Repeat the cycle every 10 seconds
    const intervalId = setInterval(startAnimation, 10000);

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
          // Smooth size transition from tiny to large
          width: animationPhase === 0 ? '15px' :
                 animationPhase === 1 ? '180px' :
                 '0px',
          height: animationPhase === 0 ? '15px' :
                  animationPhase === 1 ? '180px' :
                  '0px',
          // Smooth movement from back to front
          transform: animationPhase === 0 ? 'translate(-50%, -50%) scale(0.05) perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' :
                     animationPhase === 1 ? 'translate(-50%, -50%) scale(1.0) perspective(1000px) rotateX(360deg) rotateY(720deg) rotateZ(180deg)' :
                     'translate(-50%, -50%) scale(0) perspective(1000px)',
          left: '50%',
          top: '50%',
          zIndex: 5,
          // Smooth depth and clarity transition
          filter: animationPhase === 0 ? 'blur(3px) brightness(0.5) saturate(0.7)' :
                  animationPhase === 1 ? 'blur(0px) brightness(1.3) saturate(1.2)' :
                  'blur(0px) brightness(2) saturate(1.5)',
          opacity: animationPhase === 2 ? 0 : 1,
        }}
      />

      {/* Enhanced Splash Particles with Text Targeting */}
      {animationPhase === 2 && splashParticles.map((particle, index) => {
        const isOrangeParticle = index < 12;
        const baseColor = isOrangeParticle ? '#ff6600' : '#22c55e';
        const secondColor = isOrangeParticle ? '#ff8800' : '#34d399';
        
        return (
          <div
            key={particle.id}
            className="absolute w-5 h-5 rounded-full"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 30%, ${baseColor}, ${secondColor})`,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px) scale(${0.6 + Math.random() * 0.7})`,
              transition: `all ${1200 + particle.delay}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              animationDelay: `${particle.delay}ms`,
              opacity: 0.85,
              zIndex: 15,
              boxShadow: `0 0 15px ${baseColor}, 0 0 30px ${baseColor}40`,
              filter: 'blur(0.3px)',
              animation: `particleMove 2s ease-out ${particle.delay}ms forwards`,
              animationFillMode: 'forwards',
              // CSS custom properties for particle targeting
              ...({
                '--target-x': `${particle.targetX}px`,
                '--target-y': `${particle.targetY}px`,
              } as any),
            }}
          />
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
            WebkitTextStroke: textVisible && textRevealProgress > 0 
              ? 'none' 
              : 'none',
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
                    rgba(22, 163, 74, ${Math.min((textRevealProgress - 20) / 80, 1)}) 0%, 
                    rgba(34, 197, 94, ${Math.min((textRevealProgress - 20) / 80, 1)}) 33%, 
                    rgba(74, 222, 128, ${Math.min((textRevealProgress - 20) / 80, 1)}) 66%, 
                    rgba(22, 163, 74, ${Math.min((textRevealProgress - 20) / 80, 1)}) 100%)`
                : 'none',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: textVisible && textRevealProgress > 20 ? 'transparent' : 'transparent',
              textShadow: textVisible && textRevealProgress > 70 
                ? `0 0 30px rgba(34, 197, 94, ${(textRevealProgress - 20) / 160})` 
                : 'none',
              WebkitTextStroke: textVisible && textRevealProgress > 20 
                ? 'none' 
                : 'none',
              animation: textVisible && textRevealProgress > 80 
                ? 'gradientShift 3s ease-in-out infinite reverse' 
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