import React from 'react';

const SimpleOrangeBurst: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      
      {/* Text Display */}
      <div className="relative z-20 text-center">
        <h1 
          className="text-6xl sm:text-7xl lg:text-9xl font-black transition-all duration-2000"
          style={{
            backgroundImage: `linear-gradient(45deg, 
              rgba(255, 102, 0, 1) 0%, 
              rgba(255, 149, 0, 1) 25%, 
              rgba(255, 184, 0, 1) 50%, 
              rgba(255, 102, 0, 1) 75%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: `0 0 30px rgba(255, 102, 0, 0.5)`,
            animation: 'gradientShift 3s ease-in-out infinite',
          }}
        >
          SUPER FRUIT
          <br />
          <span 
            style={{
              backgroundImage: `linear-gradient(45deg, 
                rgba(255, 102, 0, 1) 0%, 
                rgba(255, 149, 0, 1) 33%, 
                rgba(255, 184, 0, 1) 66%, 
                rgba(255, 102, 0, 1) 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: `0 0 30px rgba(255, 102, 0, 0.5)`,
              animation: 'gradientShift 3s ease-in-out infinite',
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