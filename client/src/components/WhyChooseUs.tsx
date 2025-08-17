import React from 'react';
import { Shield, Truck, Heart, Clock, Award, Leaf } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Heart,
      title: "Farm Fresh Quality",
      description: "Handpicked fruits directly from trusted farms, ensuring maximum freshness and taste.",
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Same-day delivery available in most areas. Fresh fruits at your doorstep in hours.",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "100% satisfaction guaranteed or your money back. We stand behind our quality.",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      icon: Clock,
      title: "24/7 Service",
      description: "Order anytime, anywhere. Our team is always ready to serve you.",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: Award,
      title: "Premium Selection",
      description: "Carefully curated selection of exotic and local fruits of the highest quality.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Sustainable packaging and supporting local farmers for a greener tomorrow.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-green-600">Super Fruit Center</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to bringing you the freshest, highest-quality fruits with exceptional service that sets us apart.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 lg:p-12 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">50K+</div>
              <div className="text-green-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">100+</div>
              <div className="text-green-100">Fruit Varieties</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">15</div>
              <div className="text-green-100">Cities Served</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold mb-2">4.9★</div>
              <div className="text-green-100">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;