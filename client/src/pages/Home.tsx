import React from 'react';
import Hero from '../components/Hero';
import SimpleOrangeBurst from '../components/SimpleOrangeBurst';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProducts from '../components/FeaturedProducts';
import AndroidApp from '../components/Testimonials';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <>
      <Hero />
      <SimpleOrangeBurst />
      <WhyChooseUs />
      <FeaturedProducts />
      <AndroidApp />
      <Contact />
    </>
  );
};

export default Home;