import React from 'react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProducts from '../components/FeaturedProducts';
import AndroidApp from '../components/Testimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <FeaturedProducts />
      <AndroidApp />
    </>
  );
};

export default Home;