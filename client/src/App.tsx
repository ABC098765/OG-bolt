import { QueryClientProvider } from '@tanstack/react-query';
import { Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
import OrderSuccess from './pages/OrderSuccess';
import TermsAndConditions from './pages/TermsAndConditions';
import ProductDetails from './pages/ProductDetails';
import Notifications from './pages/Notifications';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
              <Header />
              <Notification />
              <AuthModal />
              <Route path="/" component={Home} />
              <Route path="/products" component={Products} />
              <Route path="/cart" component={Cart} />
              <Route path="/orders" component={Orders} />
              <Route path="/profile" component={Profile} />
              <Route path="/checkout" component={Checkout} />
              <Route path="/order/:orderId" component={OrderDetails} />
              <Route path="/order-success" component={OrderSuccess} />
              <Route path="/terms-and-conditions" component={TermsAndConditions} />
              <Route path="/product/:productId" component={ProductDetails} />
              <Route path="/notifications" component={Notifications} />
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;