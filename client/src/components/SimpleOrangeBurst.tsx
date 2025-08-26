import React, { useRef, useEffect, useState } from 'react';

const SimpleOrangeBurst: React.FC = () => {
  const [textVisible, setTextVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0); // 0: waiting, 1: orange moving, 2: burst, 3: reset
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const startAnimation = () => {
      // Wait 1 second, then start orange movement from back
      timeoutId = setTimeout(() => {
        setAnimationPhase(1);
        
        // After 3 seconds of slow forward movement, trigger burst
        timeoutId = setTimeout(() => {
          setAnimationPhase(2);
          setTextVisible(true);
          
          // Reset after 5 seconds
          timeoutId = setTimeout(() => {
            setAnimationPhase(0);
            setTextVisible(false);
          }, 5000);
        }, 3000);
      }, 1000);
    };

    startAnimation();
    
    // Repeat the cycle every 11 seconds
    const intervalId = setInterval(startAnimation, 11000);

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
        className={`absolute rounded-full transition-all ease-out ${
          animationPhase === 0 ? 'duration-1000' : 
          animationPhase === 1 ? 'duration-3000' : 
          'duration-500'
        }`}
        style={{
          background: 'radial-gradient(circle at 30% 30%, #ffb347, #ff8c00, #ff6600)',
          boxShadow: animationPhase === 0 ? '0 0 10px rgba(255, 102, 0, 0.3)' :
                     animationPhase === 1 ? '0 0 80px #ff6600, 0 0 120px rgba(255, 102, 0, 0.4), inset -15px -15px 30px rgba(0,0,0,0.3)' :
                     '0 0 200px #ff6600',
          // Start tiny and far back, grow as it comes forward
          width: animationPhase === 0 ? '20px' :
                 animationPhase === 1 ? '200px' :
                 '0px',
          height: animationPhase === 0 ? '20px' :
                  animationPhase === 1 ? '200px' :
                  '0px',
          // Movement from back to front
          transform: animationPhase === 0 ? 'translate(-50%, -50%) scale(0.1) perspective(1000px) rotateX(0deg) rotateY(0deg)' :
                     animationPhase === 1 ? 'translate(-50%, -50%) scale(1.2) perspective(1000px) rotateX(180deg) rotateY(360deg)' :
                     'translate(-50%, -50%) scale(0) perspective(1000px)',
          left: '50%',
          top: '50%',
          zIndex: 5,
          // 3D perspective effect
          filter: animationPhase === 0 ? 'blur(2px) brightness(0.7)' :
                  animationPhase === 1 ? 'blur(0px) brightness(1.2)' :
                  'blur(0px) brightness(2)',
          opacity: animationPhase === 2 ? 0 : 1,
        }}
      />

      {/* Splash Effects */}
      {animationPhase === 2 && (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 rounded-full animate-ping"
              style={{
                background: `radial-gradient(circle, #ff${Math.floor(Math.random()*3)+6}${Math.floor(Math.random()*3)+6}00, transparent)`,
                left: `${50 + (Math.cos(i * 30 * Math.PI / 180) * 20)}%`,
                top: `${50 + (Math.sin(i * 30 * Math.PI / 180) * 20)}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s',
                zIndex: 15
              }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <div
              key={`splash-${i}`}
              className="absolute animate-bounce"
              style={{
                left: `${50 + (Math.cos(i * 45 * Math.PI / 180) * 30)}%`,
                top: `${50 + (Math.sin(i * 45 * Math.PI / 180) * 30)}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1.5s',
                zIndex: 10
              }}
            >
              <div className="w-12 h-12 bg-orange-500 rounded-full opacity-80 animate-pulse" />
            </div>
          ))}
        </>
      )}
      
      {/* Hidden Text That Reveals */}
      <div className="relative z-20 text-center">
        <h1 
          className={`text-6xl sm:text-7xl lg:text-9xl font-black transition-all duration-2000 transform ${
            textVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-75 translate-y-8'
          }`}
          style={{
            backgroundImage: textVisible 
              ? 'linear-gradient(45deg, #ff6600, #ff9500, #ffb800, #ff6600)'
              : 'none',
            backgroundSize: '400% 400%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            animation: textVisible ? 'gradientShift 3s ease-in-out infinite' : 'none',
            textShadow: textVisible ? '0 0 30px rgba(255, 102, 0, 0.5)' : 'none',
          }}
        >
          SUPER FRUIT
          <br />
          <span 
            style={{
              backgroundImage: textVisible 
                ? 'linear-gradient(45deg, #16a34a, #22c55e, #4ade80, #16a34a)'
                : 'none',
              backgroundSize: '400% 400%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              animation: textVisible ? 'gradientShift 3s ease-in-out infinite reverse' : 'none',
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