import React from 'react';
import Hero from '../components/Hero';
import SuperFruitCenterReveal from '../components/SuperFruitCenterReveal';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProducts from '../components/FeaturedProducts';
import AndroidApp from '../components/Testimonials';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <>
      <Hero />
      <SuperFruitCenterReveal />
      <WhyChooseUs />
      <FeaturedProducts />
      <AndroidApp />
      <Contact />
    </>
  );
};

export default Home;