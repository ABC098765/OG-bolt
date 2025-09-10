import React from 'react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProducts from '../components/FeaturedProducts';
import AndroidApp from '../components/Testimonials';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

// Combined Contact and Footer component for the final snap section
const ContactAndFooter = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1">
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

const Home = () => {
  return (
    <div className="snap-scroll-container">
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
      
      <section id="contact" className="snap-section">
        <ContactAndFooter />
      </section>
    </div>
  );
};

export default Home;