import React from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-8 bg-white dark:bg-gray-900 flex-1 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get In <span className="text-green-600">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Visit our store, give us a call, or reach out online. We're here to help you find the perfect fresh fruits.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Visit Our Store</h3>
                  <p className="text-gray-600 dark:text-gray-300">Opp PH Medical Centre, Near Challenger out gate,<br />behind Thakur Mall, NS Phadke Road,<br />Thakur Village, Kandivali(E), Mumbai 400101</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Phone className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Call Us</h3>
                  <p className="text-gray-600 dark:text-gray-300">+91 9004335515<br />For orders & inquiries</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-300">superfruitcenter@gmail.com<br />For orders & support</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Store Hours</h3>
                  <div className="text-gray-600 dark:text-gray-300 space-y-1">
                    <p>Monday - Saturday: 8:00 AM - 8:00 PM</p>
                    <p>Sunday: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Contact;