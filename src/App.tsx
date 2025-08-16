import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Notification from './components/Notification';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import TermsAndConditions from './pages/TermsAndConditions';
import ProductDetails from './pages/ProductDetails';
import Notifications from './pages/Notifications';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen">
            <Header />
            <Notification />
            <AuthModal />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:orderId" element={<OrderDetails />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/product/:productId" element={<ProductDetails />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;