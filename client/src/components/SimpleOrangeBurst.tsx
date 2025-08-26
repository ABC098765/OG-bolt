import React, { useRef, useEffect, useState } from 'react';

const SimpleOrangeBurst: React.FC = () => {
  const [textVisible, setTextVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: waiting, 1: orange moving, 2: burst, 3: reset
  const [splashParticles, setSplashParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
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
          
          // Create splash particles
          const particles = [];
          for (let i = 0; i < 16; i++) {
            const angle = (i * 22.5) * Math.PI / 180; // 16 particles in circle
            const distance = 150 + Math.random() * 100; // Random distance
            particles.push({
              id: i,
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              delay: i * 50 // Staggered timing
            });
          }
          setSplashParticles(particles);
          
          // Start text reveal animation after short delay
          setTimeout(() => {
            setTextVisible(true);
            // Gradually reveal text over 2 seconds
            let progress = 0;
            const revealInterval = setInterval(() => {
              progress += 5;
              setTextRevealProgress(progress);
              if (progress >= 100) {
                clearInterval(revealInterval);
              }
            }, 50);
          }, 500);
          
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

      {/* Smooth Splash Particles */}
      {animationPhase === 2 && splashParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-6 h-6 rounded-full transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle, #ff${Math.floor(Math.random()*3)+6}${Math.floor(Math.random()*3)+6}00, #ff${Math.floor(Math.random()*3)+8}${Math.floor(Math.random()*3)+8}00)`,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px) scale(${0.5 + Math.random() * 0.8})`,
            animationDelay: `${particle.delay}ms`,
            opacity: 0.9,
            zIndex: 15,
            boxShadow: `0 0 20px #ff6600, 0 0 40px rgba(255, 102, 0, 0.6)`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
      
      {/* Text That Gets Colored by Splash */}
      <div ref={textRef} className="relative z-20 text-center">
        <h1 
          className="text-6xl sm:text-7xl lg:text-9xl font-black transition-all duration-2000"
          style={{
            background: textVisible && textRevealProgress > 0
              ? `linear-gradient(45deg, 
                  rgba(255, 102, 0, ${Math.min(textRevealProgress / 100, 1)}) 0%, 
                  rgba(255, 149, 0, ${Math.min(textRevealProgress / 100, 1)}) 25%, 
                  rgba(255, 184, 0, ${Math.min(textRevealProgress / 100, 1)}) 50%, 
                  rgba(255, 102, 0, ${Math.min(textRevealProgress / 100, 1)}) 75%)`
              : 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: textVisible && textRevealProgress > 0 ? 'transparent' : 'rgba(0, 0, 0, 0.08)',
            textShadow: textVisible && textRevealProgress > 50 
              ? `0 0 30px rgba(255, 102, 0, ${textRevealProgress / 200})` 
              : '0 0 1px rgba(255, 255, 255, 0.1)',
            WebkitTextStroke: textVisible && textRevealProgress > 0 
              ? 'none' 
              : '1px rgba(0, 0, 0, 0.05)',
            backgroundSize: '300% 100%',
            animation: textVisible && textRevealProgress > 80 
              ? 'gradientShift 3s ease-in-out infinite' 
              : 'none',
          }}
        >
          SUPER FRUIT
          <br />
          <span 
            style={{
              background: textVisible && textRevealProgress > 20
                ? `linear-gradient(45deg, 
                    rgba(22, 163, 74, ${Math.min((textRevealProgress - 20) / 80, 1)}) 0%, 
                    rgba(34, 197, 94, ${Math.min((textRevealProgress - 20) / 80, 1)}) 33%, 
                    rgba(74, 222, 128, ${Math.min((textRevealProgress - 20) / 80, 1)}) 66%, 
                    rgba(22, 163, 74, ${Math.min((textRevealProgress - 20) / 80, 1)}) 100%)`
                : 'transparent',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: textVisible && textRevealProgress > 20 ? 'transparent' : 'rgba(0, 0, 0, 0.08)',
              textShadow: textVisible && textRevealProgress > 70 
                ? `0 0 30px rgba(34, 197, 94, ${(textRevealProgress - 20) / 160})` 
                : '0 0 1px rgba(255, 255, 255, 0.1)',
              WebkitTextStroke: textVisible && textRevealProgress > 20 
                ? 'none' 
                : '1px rgba(0, 0, 0, 0.05)',
              backgroundSize: '300% 100%',
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