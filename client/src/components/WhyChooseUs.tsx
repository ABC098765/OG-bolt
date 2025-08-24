import React from 'react';
import { Truck, Clock, Award } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Same-day delivery available in most areas. Fresh fruits at your doorstep in hours.",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
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
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-green-600 underline-gradient">Super Fruit Center</span>?
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


      </div>
    </section>
  );
};

export default WhyChooseUs;