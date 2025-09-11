import React from 'react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProducts from '../components/FeaturedProducts';
import AndroidApp from '../components/Testimonials';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const Home = () => {
  // Initialize intersection observer for reveal animations
  useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    triggerOnce: true,
    observeNewElements: true,
  });

  return (
    <div className="smooth-scroll-container">
      {/* Sections with IDs */}
      <section id="home" className="reveal-section">
        <Hero />
      </section>
      
      <section id="features" className="reveal-section">
        <WhyChooseUs />
      </section>
      
      <section id="products" className="reveal-section">
        <FeaturedProducts />
      </section>
      
      <section id="app" className="reveal-section">
        <AndroidApp />
      </section>
    </div>
  );
};

export default Home;