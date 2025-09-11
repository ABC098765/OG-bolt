import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Package, Eye, Home, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);

  // Add confetti effect on component mount
  useEffect(() => {
    let animationIds: number[] = [];
    let cleanupTimeout: NodeJS.Timeout;
    
    // Enhanced confetti effect with multiple particle types and animations
    const createConfetti = () => {
      const colors = ['#22c55e', '#10b981', '#fbbf24', '#f59e0b', '#f87171', '#ef4444', '#60a5fa', '#3b82f6', '#a78bfa', '#8b5cf6', '#f472b6', '#ec4899'];
      const particles: HTMLElement[] = [];
      
      // Create burst effect from center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Create multiple waves of particles
      for (let wave = 0; wave < 3; wave++) {
        setTimeout(() => {
          for (let i = 0; i < 100; i++) {
            const particle = document.createElement('div');
            const particleType = Math.random();
            const size = Math.random() * 8 + 4; // 4-12px
            
            // Different particle shapes
            if (particleType < 0.6) {
              // Circles (60%)
              particle.style.borderRadius = '50%';
            } else if (particleType < 0.8) {
              // Stars (20%)
              particle.innerHTML = '★';
              particle.style.fontSize = size + 'px';
              particle.style.textAlign = 'center';
              particle.style.lineHeight = size + 'px';
            } else {
              // Hearts (20%)
              particle.innerHTML = '💚';
              particle.style.fontSize = size + 'px';
              particle.style.textAlign = 'center';
              particle.style.lineHeight = size + 'px';
            }
            
            particle.style.position = 'fixed';
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.backgroundColor = particleType < 0.6 ? colors[Math.floor(Math.random() * colors.length)] : 'transparent';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            particle.style.opacity = '1';
            
            // Start from center with random burst direction
            const angle = (Math.PI * 2 * i) / 100 + Math.random() * 0.5;
            const velocity = Math.random() * 15 + 10;
            const startX = centerX + Math.cos(angle) * 50;
            const startY = centerY + Math.sin(angle) * 50;
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            document.body.appendChild(particle);
            particles.push(particle);
            
            // Enhanced animation with physics
            let x = startX;
            let y = startY;
            let vx = Math.cos(angle) * velocity + (Math.random() - 0.5) * 5;
            let vy = Math.sin(angle) * velocity + (Math.random() - 0.5) * 5;
            let rotation = 0;
            let scale = 1;
            let opacity = 1;
            let time = 0;
            
            const animateParticle = () => {
              if (!document.body.contains(particle)) return;
              
              time += 0.016; // ~60fps
              
              // Physics
              vy += 0.5; // gravity
              vx *= 0.99; // air resistance
              vy *= 0.995;
              
              x += vx;
              y += vy;
              
              // Rotation and scaling
              rotation += (vx + vy) * 0.1;
              scale = 1 + Math.sin(time * 5) * 0.1;
              opacity = Math.max(0, 1 - time / 4); // fade out over 4 seconds
              
              // Apply transformations
              particle.style.left = x + 'px';
              particle.style.top = y + 'px';
              particle.style.transform = `rotate(${rotation}deg) scale(${scale})`;
              particle.style.opacity = opacity.toString();
              
              // Continue animation or cleanup
              if (y < window.innerHeight + 100 && opacity > 0.1 && time < 5) {
                const animationId = requestAnimationFrame(animateParticle);
                animationIds.push(animationId);
              } else {
                if (document.body.contains(particle)) {
                  document.body.removeChild(particle);
                }
              }
            };
            
            // Stagger particle start times for wave effect
            setTimeout(() => {
              const animationId = requestAnimationFrame(animateParticle);
              animationIds.push(animationId);
            }, Math.random() * 200);
          }
        }, wave * 400); // 400ms between waves
      }
      
      // Additional shooting stars effect
      setTimeout(() => {
        for (let i = 0; i < 20; i++) {
          const star = document.createElement('div');
          star.innerHTML = '✨';
          star.style.position = 'fixed';
          star.style.fontSize = (Math.random() * 10 + 8) + 'px';
          star.style.left = Math.random() * window.innerWidth + 'px';
          star.style.top = '-20px';
          star.style.pointerEvents = 'none';
          star.style.zIndex = '9999';
          star.style.opacity = '1';
          
          document.body.appendChild(star);
          particles.push(star);
          
          let y = -20;
          let opacity = 1;
          
          const animateStar = () => {
            if (!document.body.contains(star)) return;
            
            y += Math.random() * 8 + 5;
            opacity -= 0.015;
            
            star.style.top = y + 'px';
            star.style.opacity = opacity.toString();
            star.style.transform = `rotate(${y * 2}deg)`;
            
            if (y < window.innerHeight + 50 && opacity > 0) {
              const animationId = requestAnimationFrame(animateStar);
              animationIds.push(animationId);
            } else {
              if (document.body.contains(star)) {
                document.body.removeChild(star);
              }
            }
          };
          
          setTimeout(() => {
            const animationId = requestAnimationFrame(animateStar);
            animationIds.push(animationId);
          }, i * 150);
        }
      }, 500);
      
      // Extended cleanup
      cleanupTimeout = setTimeout(() => {
        particles.forEach(particle => {
          if (document.body.contains(particle)) {
            document.body.removeChild(particle);
          }
        });
      }, 6000); // Extended to 6 seconds
    };

    createConfetti();

    // Cleanup function
    return () => {
      // Cancel all animation frames
      animationIds.forEach(id => cancelAnimationFrame(id));
      // Clear timeout
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
      // Remove any remaining particles
      const remainingParticles = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 9999"]');
      remainingParticles.forEach(particle => {
        if (document.body.contains(particle)) {
          document.body.removeChild(particle);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="relative inline-flex">
              <CheckCircle className="w-24 h-24 text-green-600 animate-pulse" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-green-600 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🎉 Order Placed Successfully!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Thank you for your order! We're already preparing your fresh fruits for delivery.
            </p>
            
            {/* Order Status */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-green-600 mr-3" />
                <span className="text-lg font-semibold text-green-800 dark:text-green-400">Order Confirmed</span>
              </div>
              <p className="text-green-700 dark:text-green-300 text-center">
                Your order has been confirmed and will be delivered within 24-48 hours.
              </p>
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-3 text-center">
                What happens next?
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <span className="text-blue-800 dark:text-blue-300">Order preparation begins immediately</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <span className="text-blue-800 dark:text-blue-300">You'll receive order updates via notifications</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <span className="text-blue-800 dark:text-blue-300">Fresh fruits delivered to your doorstep</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-green-600 text-white py-4 px-8 rounded-2xl hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center"
              data-testid="button-view-orders"
            >
              <Eye className="w-5 h-5 mr-2" />
              Track Your Orders
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 py-4 px-8 rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors font-semibold text-lg flex items-center justify-center"
              data-testid="button-continue-shopping"
            >
              <Home className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Need help? Contact us at{' '}
              <span className="text-green-600 dark:text-green-400 font-semibold">superfruitcenter@gmail.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;