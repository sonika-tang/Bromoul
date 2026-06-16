import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '../assets/Bromoul-logo.png';

const Navbar = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'ទំព័រដើម', path: '/' },
    { label: 'ផ្សារ', path: '/psar' },
    { label: 'វិភាគ', path: '/vipheak' },
    { label: 'កន្ត្រក', path: '/cart', hasBadge: true },
    { label: 'សារ', path: '/chat' },
    { label: 'គណនី', path: '/profile' },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className={styles.navContainer}>

        {/* Logo */}
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="Bromoul" className={styles.logoImg} />
        </Link>

        {/* Desktop links */}
        <div className={styles.desktopMenu}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''}`}
            >
              {item.label}
              {item.hasBadge && cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className={styles.navRight}>
          <div className={`${styles.roleBadge} ${userRole === 'farmer' ? styles.roleFarmer : styles.roleBuyer}`}>
            {userRole === 'farmer' ? 'កសិករ' : 'អ្នកទិញ'}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={styles.mobileToggle}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuInner}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.mobileLink} ${isActive(item.path) ? styles.mobileLinkActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
              {item.hasBadge && cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
