import React from 'react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProducts from '../components/FeaturedProducts';
import AndroidApp from '../components/Testimonials';

const Home = () => {
  return (
    <div className="snap-scroll-container">
      {/* Navigation Dots */}
      <nav className="scroll-nav" aria-label="Page navigation">
        <a 
          href="#home" 
          className="scroll-nav-dot" 
          data-label="Home"
          aria-label="Go to Home section"
        ></a>
        <a 
          href="#features" 
          className="scroll-nav-dot" 
          data-label="Features"
          aria-label="Go to Features section"
        ></a>
        <a 
          href="#products" 
          className="scroll-nav-dot" 
          data-label="Products"
          aria-label="Go to Products section"
        ></a>
        <a 
          href="#app" 
          className="scroll-nav-dot" 
          data-label="App"
          aria-label="Go to App section"
        ></a>
      </nav>

      {/* Sections with IDs */}
      <section id="home" className="snap-section">
        <Hero />
      </section>
      
      <section id="features" className="snap-section">
        <WhyChooseUs />
      </section>
      
      <section id="products" className="snap-section">
        <FeaturedProducts />
      </section>
      
      <section id="app" className="snap-section">
        <AndroidApp />
      </section>
    </div>
  );
};

export default Home;