import React, { memo, useEffect, useState, useCallback } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, Star, Heart, Award, Clock, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const banners = [
  {
    id: 1,
    badge: "#1 Fresh Fruit Delivery",
    title: "Premium Quality Fresh Fruits",
    description: "Experience the finest selection of farm-fresh fruits delivered directly to your doorstep with our premium daily service.",
    image: "/Fresh_fruit_hero_display_11baa93f.png",
    primaryAction: { label: "Shop Now", link: "/products", icon: ShoppingCart },
    secondaryAction: { label: "Our Story", link: "/juice-recipes", icon: Heart },
    bgColor: "from-green-500/20 to-emerald-500/20",
    accentColor: "green"
  },
  {
    id: 2,
    badge: "Seasonal Specials",
    title: "Fresh Harvest Seasonal Fruits",
    description: "Discover our hand-picked selection of the season's best fruits, ripened naturally and packed with nutrients and flavor.",
    image: "/splash1.png",
    primaryAction: { label: "View Deals", link: "/products", icon: Star },
    secondaryAction: { label: "Recipes", link: "/juice-recipes", icon: Leaf },
    bgColor: "from-orange-500/20 to-amber-500/20",
    accentColor: "orange"
  },
  {
    id: 3,
    badge: "Express Delivery",
    title: " Freshness Delivered, Fast! ",
    description: "Get your fresh vitamins delivered within hours. We ensure your fruits arrive at peak freshness every single time.",
    image: "/express-delivery.png",
    isBgImage: true,
    primaryAction: { label: "Order Now", link: "/products", icon: Clock },
    secondaryAction: { label: "Details", link: "/", icon: Award },
    bgColor: "from-blue-500/80 to-sky-500/80",
    accentColor: "blue",
    dotColor: "bg-blue-500"
  }
];

const Hero = memo(() => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    duration: 50,
    dragFree: false,
    containScroll: false,
    align: 'center',
    skipSnaps: false
  }, [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false })]);

  const [selectedIndex, setSelectedIndex] = useState(0);

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
    <section id="home" className="relative bg-white dark:bg-gray-950 overflow-hidden">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex">
          {banners.map((banner, index) => (
            <div key={banner.id} className="embla__slide flex-[0_0_100%] min-w-0 relative">
              {/* Background Decorative Elements */}
              {banner.isBgImage ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center -z-10"
                  style={{ backgroundImage: `url(${banner.image})` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${banner.bgColor} opacity-90`} />
                </div>
              ) : (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${banner.bgColor} opacity-50 -z-10`} />
                  <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />
                </>
              )}
              
              <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 min-h-[85vh] flex flex-col lg:flex-row items-center gap-12 relative">
                {/* Content Side */}
                <div className={`lg:w-3/5 space-y-8 text-left z-10 ${banner.isBgImage ? 'text-white' : ''}`}>
                  <div className={`inline-flex items-center px-4 py-1.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-left duration-700`}>
                    <span className={`w-2 h-2 rounded-full ${banner.dotColor || `bg-${banner.accentColor}-500`} mr-2 animate-pulse`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      {banner.badge}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h1 className={`text-5xl sm:text-6xl lg:text-8xl font-black ${banner.isBgImage ? 'text-white' : 'text-gray-900 dark:text-white'} leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom duration-1000`}>
                      {banner.title.split(' ').map((word, i) => (
                        <span key={i} className={i >= banner.title.split(' ').length - 2 ? (banner.isBgImage ? `text-${banner.accentColor}-200 block sm:inline` : `text-${banner.accentColor}-600 block sm:inline`) : "inline"}>
                          {word}{' '}
                        </span>
                      ))}
                    </h1>
                    <p className={`text-lg sm:text-xl ${banner.isBgImage ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'} max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000 delay-200`}>
                      {banner.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                    <Link 
                      to={banner.primaryAction.link}
                      className={`px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg hover:scale-105 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center gap-2 group`}
                    >
                      <banner.primaryAction.icon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      {banner.primaryAction.label}
                    </Link>
                    <Link 
                      to={banner.secondaryAction.link}
                      className={`px-8 py-4 rounded-2xl ${banner.isBgImage ? 'bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'} font-bold text-lg transition-all flex items-center gap-2 group`}
                    >
                      <banner.secondaryAction.icon className={`w-5 h-5 ${banner.isBgImage ? 'text-white/70' : 'text-gray-400'} group-hover:text-red-500 transition-colors`} />
                      {banner.secondaryAction.label}
                    </Link>
                  </div>
                </div>

                {/* Image Side */}
                {!banner.isBgImage && (
                  <div className="lg:w-2/5 relative h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-150">
                    <div className={`absolute w-full aspect-square bg-${banner.accentColor}-500/10 blur-[100px] rounded-full`} />
                    <img 
                      src={banner.image} 
                      alt={banner.title} 
                      className="w-full h-auto max-h-[500px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Floating Elements */}
                    <div className="absolute top-10 right-0 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-bounce duration-[3000ms] hidden sm:block">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${banner.accentColor}-100 flex items-center justify-center`}>
                          <Star className={`w-6 h-6 text-${banner.accentColor}-600`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Rating</p>
                          <p className="text-sm font-black">4.9/5.0</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Controls */}
      <div className="absolute bottom-10 left-6 right-6 max-w-7xl mx-auto flex items-center justify-between pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1.5 transition-all duration-500 rounded-full ${index === selectedIndex ? 'w-12 bg-gray-900 dark:bg-white' : 'w-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={() => emblaApi?.scrollPrev()}
            className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => emblaApi?.scrollNext()}
            className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
});

export default Hero;