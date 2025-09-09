import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Bot, CreditCard, Play, X } from 'lucide-react';

import og_replit_sfc from "@assets/og replit sfc.png";

const AndroidApp = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  
  const screenshots = [
    { src: '/android-app-home.jpg', alt: 'Home Screen' },
    { src: '/android-app-products.jpg', alt: 'Products Screen' },
    { src: '/android-app-cart.jpg', alt: 'Shopping Cart Screen' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenshot((prev) => (prev + 1) % screenshots.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [screenshots.length]);

  return (
    <>
      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 relative animate-in zoom-in duration-300">
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              data-testid="button-close-modal"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Play className="w-10 h-10 text-white fill-current" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Coming Soon!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our Android app is currently in development. Stay tuned for the launch!
              </p>
              
              <button
                onClick={() => setShowComingSoon(false)}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
                data-testid="button-ok-modal"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-orange-300 to-yellow-300 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 text-green-600 dark:text-green-400 rounded-full text-xs font-medium mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20"></div>
            <Smartphone className="w-3 h-3 mr-1.5 relative z-10" />
            <span className="relative z-10 font-semibold tracking-wide uppercase">Download Now</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-600 rounded-full"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Our <span className="text-green-600 underline-gradient">
              Android App
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the convenience of fresh fruit shopping with our mobile app. Order anytime, anywhere with just a few taps.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* App Info */}
          <div className="space-y-8">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-20 h-20 bg-transparent rounded-2xl flex items-center justify-center shadow-2xl">
                <img
                  src={og_replit_sfc}
                  alt="Super Fruit Center Logo"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-2xl font-bold text-white">🍎</span>';
                    }
                  }}
                />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">SUPER FRUIT CENTER</h3>
                <p className="text-gray-600 dark:text-gray-300">Fresh Fruits Delivered Daily</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Easy Mobile Ordering</h4>
                  <p className="text-gray-600 dark:text-gray-300">Browse our complete catalog and place orders with intuitive mobile interface.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fruits Suggestor</h4>
                  <p className="text-gray-600 dark:text-gray-300">Get personalized fruit recommendations from our intelligent AI assistant.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Online Payment Support</h4>
                  <p className="text-gray-600 dark:text-gray-300">Secure and convenient payment options including cards, UPI, and digital wallets.</p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-6">
              <button
                onClick={() => setShowComingSoon(true)}
                className="group flex items-center justify-center bg-black text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
                data-testid="button-google-play"
              >
                <Play className="w-6 h-6 mr-3 fill-current" />
                <div className="text-left">
                  <div className="text-xs text-gray-300">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>

          {/* Actual Phone Display with Screenshots */}
          <div className="relative">
            <div className="relative z-10 max-w-sm mx-auto">
              {/* Phone Frame */}
              <div className="bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* App Screenshot */}
                  <div className="relative h-[600px] overflow-hidden">
                    <img
                      src={screenshots[currentScreenshot].src}
                      alt={screenshots[currentScreenshot].alt}
                      className="w-full h-full object-cover transition-opacity duration-500"
                      onError={(e) => {
                        console.error('Failed to load screenshot:', screenshots[currentScreenshot].src);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    
                    {/* Screenshot Navigation Dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {screenshots.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentScreenshot(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentScreenshot 
                              ? 'bg-white shadow-lg' 
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-green-400 to-emerald-400 rounded-[3rem] -z-10 opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default AndroidApp;