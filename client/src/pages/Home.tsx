import React from 'react';
import Hero from '../components/Hero';
import ThreeJsOrangeBurst from '../components/ThreeJsOrangeBurst';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProducts from '../components/FeaturedProducts';
import AndroidApp from '../components/Testimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <ThreeJsOrangeBurst />
      <WhyChooseUs />
      <FeaturedProducts />
      <AndroidApp />
    </>
  );
};

export default Home;