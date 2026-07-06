import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import { ShoppingCart, Heart, Sun, Moon, Menu, X, User, LogOut, Leaf } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isDarkMode } = useSelector((state) => state.theme);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Manage scrolling state for transparent->opaque animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Build breadcrumbs
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    if (pathnames.length === 0) return null;

    return (
      <nav className="container" style={{ padding: '0.75rem 1.5rem 0' }}>
        <ul className="breadcrumbs" style={{ display: 'flex', listStyle: 'none', gap: '0.5rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
          <li>
            <Link to="/" style={{ color: 'var(--color-forest)', fontWeight: 600 }}>Home</Link>
          </li>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const label = value.charAt(0).toUpperCase() + value.slice(1);

            return last ? (
              <li key={to} style={{ color: 'var(--color-text-dark)', fontWeight: 500 }}>
                {label}
              </li>
            ) : (
              <li key={to}>
                <Link to={to} style={{ color: 'var(--color-forest)' }}>{label}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  };

  const isHome = location.pathname === '/';
  const navbarBg = isHome && !isScrolled ? 'transparent' : 'var(--color-card-bg)';
  const navbarColor = isHome && !isScrolled ? '#ffffff' : 'var(--color-text-dark)';
  const navbarBorder = isHome && !isScrolled ? 'none' : '1px solid var(--color-border)';

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: navbarBg,
          color: navbarColor,
          borderBottom: navbarBorder,
          backdropFilter: isHome && !isScrolled ? 'none' : 'blur(12px)',
          transition: 'all 0.3s ease',
          boxShadow: isHome && !isScrolled ? 'none' : 'var(--shadow-sm)'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: isHome && !isScrolled ? '#ffffff' : 'var(--color-forest)' }}>
            <Leaf size={28} style={{ transform: 'rotate(45deg)', fill: isHome && !isScrolled ? '#ffffff' : 'var(--color-leaf)' }} />
            <span>OrganicCo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-menu">
            <Link to="/" style={{ fontWeight: 600 }}>Home</Link>
            <Link to="/products" style={{ fontWeight: 600 }}>Shop</Link>
            <Link to="/wishlist" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--color-earth)', color: '#ffffff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--color-forest)', color: '#ffffff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                  {cartItems.length}
                </span>
              )}
            </Link>
            
            {/* Theme Toggle */}
            <button onClick={() => dispatch(toggleTheme())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth section */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <User size={18} />
                  <span>{user?.name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} className="mobile-menu-toggle">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{ backgroundColor: 'var(--color-card-bg)', borderBottom: '1px solid var(--color-border)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} /> Wishlist ({wishlistItems.length})
            </Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} /> Cart ({cartItems.length})
            </Link>
            <button onClick={() => { dispatch(toggleTheme()); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-dark)', fontWeight: 600 }}>
              {isDarkMode ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile ({user?.name})</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dark)', fontWeight: 600 }}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            )}
          </div>
        )}
      </header>
      
      {/* CSS rules to support responsive toggle */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-toggle { display: block !important; }
        }
      `}</style>

      {/* Breadcrumbs Render */}
      {getBreadcrumbs()}
    </>
  );
}

export default Navbar;
