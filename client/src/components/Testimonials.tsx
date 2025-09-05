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
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
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

          {/* Enhanced Phone Display with Screenshots */}
          <div className="relative">
            <div className="relative z-10 max-w-sm mx-auto transform hover:scale-105 transition-transform duration-300">
              {/* Phone Frame with Realistic Details */}
              <div className="bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[3.5rem] p-3 shadow-2xl ring-4 ring-gray-700/20">
                
                {/* Phone Speaker and Camera */}
                <div className="flex justify-center items-center mb-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-800 rounded-full ml-3 ring-2 ring-gray-600"></div>
                </div>
                
                {/* Screen Container */}
                <div className="bg-black rounded-[2.8rem] p-1 shadow-inner">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden relative">
                    
                    {/* Status Bar */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-8 flex items-center justify-between px-6 text-white text-xs font-medium">
                      <div className="flex items-center space-x-1">
                        <div className="text-white">9:41 AM</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <div className="w-6 h-3 border border-white rounded-sm relative">
                          <div className="w-4 h-1.5 bg-white rounded-xs absolute top-0.5 left-0.5"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* App Screenshot */}
                    <div className="relative h-[580px] overflow-hidden bg-gray-50">
                      <img
                        src={screenshots[currentScreenshot].src}
                        alt={screenshots[currentScreenshot].alt}
                        className="w-full h-full object-cover transition-all duration-700 transform"
                        onError={(e) => {
                          console.error('Failed to load screenshot:', screenshots[currentScreenshot].src);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      
                      {/* Floating Action Button Simulation */}
                      <div className="absolute bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      
                      {/* Screenshot Navigation Dots */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
                        {screenshots.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentScreenshot(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 transform ${
                              index === currentScreenshot 
                                ? 'bg-orange-500 shadow-lg scale-125' 
                                : 'bg-white/60 hover:bg-white/80 hover:scale-110'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Home Indicator */}
                    <div className="flex justify-center pb-2 pt-1">
                      <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Background Decoration */}
            <div className="absolute -top-8 -right-8 w-full h-full bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 rounded-[4rem] -z-10 opacity-15 blur-sm"></div>
            <div className="absolute -bottom-4 -left-4 w-3/4 h-3/4 bg-gradient-to-tr from-orange-400 to-yellow-400 rounded-[3rem] -z-20 opacity-10"></div>
            
            {/* Floating Elements */}
            <div className="absolute top-10 -left-6 w-4 h-4 bg-green-400 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 -right-8 w-6 h-6 bg-orange-400 rounded-full opacity-40 animate-pulse delay-300"></div>
            <div className="absolute top-32 -right-4 w-3 h-3 bg-emerald-400 rounded-full opacity-35 animate-pulse delay-700"></div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default AndroidApp;