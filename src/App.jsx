import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layout
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Pages
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';
import Profile from './pages/Profile/Profile';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

// Icons
import { ArrowUp, ShoppingCart } from 'lucide-react';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Back to top & Floating elements helper
function FloatingControls() {
  const [visible, setVisible] = React.useState(false);
  const { items } = useSelector((state) => state.cart);
  const activeItemsCount = items.filter(item => !item.saved_for_later).reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const toggleVisible = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', left: '2rem', display: 'flex', gap: '0.75rem', zIndex: 99 }}>
      {/* Floating Back to Top */}
      {visible && (
        <button
          onClick={scrollToTop}
          style={{
            backgroundColor: 'var(--color-earth)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition-smooth)'
          }}
          title="Back to Top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* Floating Cart Indicator */}
      {activeItemsCount > 0 && (
        <a
          href="/cart"
          style={{
            backgroundColor: 'var(--color-forest)',
            color: '#ffffff',
            borderRadius: 'var(--radius-full)',
            padding: '0 1.25rem',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}
        >
          <ShoppingCart size={18} />
          <span>Cart ({activeItemsCount})</span>
        </a>
      )}
    </div>
  );
}

// Inner App with dark mode init hook
function MainLayout() {
  const { isDarkMode } = useSelector((state) => state.theme);

  // Initialize theme class on boot
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* SVG Linen/Paper Texture Background Filter */}
      <svg style={{ display: 'none' }} aria-hidden="true">
        <filter id="paper-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2" result="light">
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
          <feBlend mode="multiply" in="SourceGraphic" in2="light" />
        </filter>
      </svg>
      <div className="texture-overlay" style={{ filter: 'url(#paper-texture)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.05, zIndex: 9999 }}></div>

      <ScrollToTop />
      <Navbar />

      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
      <FloatingControls />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}

export default App;
