import React, { memo, useEffect, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Star, Heart, Award, Clock, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const banners = [
  {
    id: 1,
    badge: "#1 Fresh Fruit Delivery Service",
    title: "Fresh Fruits Delivered Daily",
    subtitle: "Super Fruit Center",
    description: "Experience the finest selection of farm-fresh fruits. From exotic imports to local favorites, we bring nature's sweetness to your doorstep.",
    image: "/Fresh_fruit_hero_display_11baa93f.png",
    primaryAction: { label: "Shop Now", link: "/products", icon: ShoppingCart },
    secondaryAction: { label: "Juice Recipes", link: "/juice-recipes", icon: Heart },
    color: "green"
  },
  {
    id: 2,
    badge: "100% Organic Selection",
    title: "Naturally Grown, Purely Delicious",
    subtitle: "Organic Excellence",
    description: "Our organic fruits are grown without synthetic pesticides. Enjoy the pure, unadulterated taste of nature's best harvest.",
    image: "/splash1.png",
    primaryAction: { label: "View Organic", link: "/products", icon: Leaf },
    secondaryAction: { label: "Our Story", link: "/", icon: Award },
    color: "orange"
  },
  {
    id: 3,
    badge: "Same Day Delivery",
    title: "From Farm to Table Today",
    subtitle: "Fast & Fresh",
    description: "Don't wait for freshness. Our same-day delivery service ensures you get your fruits at the peak of their flavor and nutrition.",
    image: "/splash2.png",
    primaryAction: { label: "Order Now", link: "/products", icon: Clock },
    secondaryAction: { label: "Delivery Info", link: "/", icon: Star },
    color: "blue"
  }
];

const Hero = memo(() => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section id="home" className="relative overflow-hidden pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {banners.map((banner) => (
            <div key={banner.id} className="embla__slide flex-[0_0_100%] min-w-0 relative">
              <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20 flex flex-col lg:flex-row items-center gap-12 min-h-[80vh]">
                <div className="lg:w-1/2 space-y-8 text-left z-10">
                  <div className={`inline-flex items-center px-4 py-2 bg-${banner.color}-100 dark:bg-${banner.color}-900 text-${banner.color}-800 dark:text-${banner.color}-200 rounded-full text-sm font-medium animate-in fade-in slide-in-from-left duration-700`}>
                    <Award className="w-4 h-4 mr-2" />
                    {banner.badge}
                  </div>

                  <div className="space-y-6">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                      <span className={`text-lg sm:text-xl lg:text-2xl font-medium text-gray-600 dark:text-gray-400 block mb-2`}>{banner.subtitle}</span>
                      {banner.title.split(' ').map((word, i) => (
                        <span key={i} className={i % 2 === 1 ? `text-${banner.color}-600` : ""}>
                          {word}{' '}
                        </span>
                      ))}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                      {banner.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
                    <Link 
                      to={banner.primaryAction.link}
                      className={`group relative overflow-hidden bg-gradient-to-r from-${banner.color}-600 to-${banner.color}-700 text-white px-8 py-4 rounded-full hover:from-${banner.color}-700 hover:to-${banner.color}-800 transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="relative z-10 flex items-center">
                        <banner.primaryAction.icon className="w-5 h-5 mr-2" />
                        {banner.primaryAction.label}
                      </div>
                    </Link>
                    <Link 
                      to={banner.secondaryAction.link}
                      className={`group relative overflow-hidden border-2 border-${banner.color}-500 text-${banner.color}-500 px-8 py-4 rounded-full hover:bg-${banner.color}-500 hover:text-white transition-all transform hover:scale-105 font-semibold text-lg flex items-center justify-center shadow-lg hover:shadow-xl`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="relative z-10 flex items-center">
                        <banner.secondaryAction.icon className="w-5 h-5 mr-2" />
                        {banner.secondaryAction.label}
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="lg:w-1/2 relative animate-in fade-in zoom-in duration-1000">
                  <div className={`absolute inset-0 bg-${banner.color}-500/10 blur-3xl rounded-full`}></div>
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="relative z-10 w-full h-auto max-h-[500px] object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <button 
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 hover:bg-white/40 transition-all hidden sm:block"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-gray-800 hover:bg-white/40 transition-all hidden sm:block"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2 transition-all duration-300 rounded-full ${index === selectedIndex ? 'w-8 bg-green-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </section>
  );
});

export default Hero;