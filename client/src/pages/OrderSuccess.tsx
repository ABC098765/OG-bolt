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
    
    // Simple confetti effect simulation with browser APIs
    const createConfetti = () => {
      const colors = ['#22c55e', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa'];
      const particles: HTMLElement[] = [];
      
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '-10px';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.pointerEvents = 'none';
        particle.style.borderRadius = '50%';
        particle.style.zIndex = '9999';
        document.body.appendChild(particle);
        particles.push(particle);
        
        const animateParticle = () => {
          if (!document.body.contains(particle)) return; // Safety check
          
          const fallSpeed = Math.random() * 3 + 2;
          const drift = Math.sin(Date.now() * 0.01) * 2;
          const currentTop = parseFloat(particle.style.top) || -10;
          
          particle.style.top = currentTop + fallSpeed + 'px';
          particle.style.left = parseFloat(particle.style.left) + drift + 'px';
          
          if (currentTop < window.innerHeight + 20) {
            const animationId = requestAnimationFrame(animateParticle);
            animationIds.push(animationId);
          } else {
            if (document.body.contains(particle)) {
              document.body.removeChild(particle);
            }
          }
        };
        
        setTimeout(() => {
          const animationId = requestAnimationFrame(animateParticle);
          animationIds.push(animationId);
        }, i * 100);
      }
      
      // Remove all particles after 3 seconds
      cleanupTimeout = setTimeout(() => {
        particles.forEach(particle => {
          if (document.body.contains(particle)) {
            document.body.removeChild(particle);
          }
        });
      }, 3000);
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