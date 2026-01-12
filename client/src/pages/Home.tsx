import React from 'react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import JuiceRecipesSection from '../components/JuiceRecipesSection';
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
    <div className="smooth-scroll-container flex flex-col">
      {/* Sections with IDs */}
      <section id="home" className="reveal-section w-full">
        <Hero />
      </section>
      
      <section id="features" className="reveal-section w-full">
        <WhyChooseUs />
      </section>
      
      <section id="juice-recipes" className="reveal-section w-full">
        <JuiceRecipesSection />
      </section>
      
      <section id="products" className="reveal-section w-full">
        <FeaturedProducts />
      </section>
      
      <section id="app" className="reveal-section w-full">
        <AndroidApp />
      </section>
    </div>
  );
};

export default Home;