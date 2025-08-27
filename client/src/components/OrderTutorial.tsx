import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShoppingCart, MapPin, CreditCard, CheckCircle, Package } from 'lucide-react';

interface OrderTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

const OrderTutorial: React.FC<OrderTutorialProps> = ({ isOpen, onClose, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const tutorialSteps = [
    {
      icon: <Package className="w-12 h-12 text-green-600" />,
      title: "Welcome to Super Fruit Center!",
      description: "Let's learn how to place your first order in just a few simple steps.",
      animation: "fade-in"
    },
    {
      icon: <ShoppingCart className="w-12 h-12 text-orange-500" />,
      title: "Step 1: Browse & Add to Cart",
      description: "Browse our fresh fruits collection and add your favorites to cart. You can adjust quantities anytime!",
      animation: "slide-up"
    },
    {
      icon: <MapPin className="w-12 h-12 text-blue-500" />,
      title: "Step 2: Add Delivery Address",
      description: "Add your delivery address during checkout. You can save multiple addresses for future orders.",
      animation: "slide-left"
    },
    {
      icon: <CreditCard className="w-12 h-12 text-purple-500" />,
      title: "Step 3: Choose Payment Method",
      description: "Select your preferred payment method. We support Cash on Delivery for your convenience.",
      animation: "slide-right"
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-green-600" />,
      title: "Step 4: Place Your Order",
      description: "Review your order and place it! You'll get real-time updates on your order status.",
      animation: "bounce"
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onClose();
    }
  };

  const skipTutorial = () => {
    onSkip();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepData = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 opacity-20"></div>
        
        {/* Close Button */}
        <button
          onClick={skipTutorial}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentStep + 1} of {tutorialSteps.length}
            </span>
            <button
              onClick={skipTutorial}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Skip Tutorial
            </button>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Tutorial Content */}
        <div className={`text-center transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          {/* Icon */}
          <div className={`mb-6 flex justify-center animate-${currentStepData.animation}`}>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-lg">
              {currentStepData.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {currentStep < tutorialSteps.length - 1 ? (
              <button
                onClick={nextStep}
                className="bg-gradient-to-r from-green-600 to-orange-600 text-white px-8 py-3 rounded-full hover:from-green-700 hover:to-orange-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-green-600 to-orange-600 text-white px-8 py-3 rounded-full hover:from-green-700 hover:to-orange-700 transition-all duration-300 font-semibold flex items-center shadow-lg transform hover:scale-105"
              >
                Start Shopping
                <CheckCircle className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-200 dark:bg-green-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-200 dark:bg-orange-800 rounded-full opacity-20 animate-pulse delay-300"></div>
      </div>
    </div>
  );
};

export default OrderTutorial;