import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../assets/Bromoul-logo.png';

const BromoulLogo = () => (
  <div style={{
    fontFamily: 'Noto Sans Khmer',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    letterSpacing: '1px'
  }}>
    <span style={{ color: '#4CAF50' }}>ព</span>
    <span style={{ color: '#FF9800' }}>រ</span>
  </div>
);

const Navbar = ({ userRole, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'ទំព័រដើម', path: '/' },
    { label: 'ផ្សារ', path: '/psar' },
    { label: 'វិភាគ', path: '/vipheak' },
    { label: 'កន្ត្រក', path: '/cart', hasBadge: true },
    { label: 'សារ', path: '/chat' },
    { label: 'គណនី', path: '/profile' }
  ];

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('bromoul:cart') || '[]');
      setCartCount(cart.length);
    };
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="logo" style={{ width: '60px', height: '45px' }} />
        </Link>

        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''}`}
            >
              {item.label}
              {item.hasBadge && cartCount > 0 && (
                <span className={styles.badge}>
                  {cartCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Role Badge & Mobile Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Role Badge */}
          <div style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: userRole === 'farmer' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
            color: userRole === 'farmer' ? '#4CAF50' : '#FF9800'
          }}>
            {userRole === 'farmer' ? 'កសិករ' : 'អ្នកទិញ'}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={styles.mobileToggle}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.mobileLink} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
              {item.hasBadge && cartCount > 0 && (
                <span className={styles.badge}>
                  {cartCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;