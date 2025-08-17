import React from 'react';
import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center text-2xl font-bold text-white">
              <img 
                src="/logo-placeholder.png" 
                alt="Super Fruit Center Logo" 
                className="w-12 h-12 mr-3"
                onError={(e) => {
                  // Fallback to text if logo not found
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling;
                  if (nextElement && nextElement instanceof HTMLElement) {
                    nextElement.style.display = 'inline';
                  }
                }}
              />
              <span style={{ display: 'none' }}>🍎</span>
              Super Fruit Center
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your trusted source for the freshest, highest-quality fruits. 
              Serving the community for over 15 years with passion and dedication.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-green-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-pink-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" onClick={scrollToTop} className="text-gray-300 hover:text-green-400 transition-colors">Home</Link></li>
              <li><Link to="/products" onClick={scrollToTop} className="text-gray-300 hover:text-green-400 transition-colors">Products</Link></li>
              <li><Link to="/cart" onClick={scrollToTop} className="text-gray-300 hover:text-green-400 transition-colors">Cart</Link></li>
              <li><Link to="/orders" onClick={scrollToTop} className="text-gray-300 hover:text-green-400 transition-colors">Orders</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-green-400 transition-colors">Our Android App</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">Opp PH Medical Centre, Near Challenger out gate, behind Thakur Mall, NS Phadke Road, Thakur Village, Kandivali(E), Mumbai 400101.</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">+91 9004335515</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">superfruitcenter@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Super Fruit Center. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms-and-conditions" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Privacy Policy & Terms and Conditions</Link>
              <a href="#" className="text-gray-400 hover:text-green-400 text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;