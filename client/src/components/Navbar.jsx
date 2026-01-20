
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';
import { CartService } from '../services/cartService';

// Text Logo Component
const BromoulLogo = () => (
    <div style={{ fontFamily: 'Noto Sans Khmer', fontWeight: 'bold', fontSize: '1.5rem', letterSpacing: '1px' }}>
        <span style={{ color: '#4CAF50' }}>BROM</span>
        <span style={{ color: '#FF9800' }}>OUL</span>
    </div>
);

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);

    const isActive = (path) => location.pathname === path;

    // Khmer Navigation Items
    const navItems = [
        { label: 'ទំព័រដើម', path: '/' }, // Home
        { label: 'ផ្សារ', path: '/psar' }, // Market
        { label: 'វិភាគ', path: '/vipheak' }, // Analytic
        { label: 'កន្ត្រក', path: '/cart', hasBadge: true }, // Cart
        { label: 'សារ', path: '/chat' }, // Chat (New)
        { label: 'ប្រវត្តិរូប', path: '/profile' }, // Profile
    ];

    // Simple cart count update effect
    useEffect(() => {
        const updateCount = async () => {
            const items = await CartService.getCart();
            setCartCount(items.length);
        };
        updateCount();

        window.addEventListener('cartUpdated', updateCount);
        return () => window.removeEventListener('cartUpdated', updateCount);
    }, []);

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <Link to="/" className={styles.logoLink}>
                    <BromoulLogo />
                </Link>

                {/* Desktop Menu */}
                <div className={styles.desktopMenu}>
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                        >
                            {item.label}
                            {item.hasBadge && cartCount > 0 && (
                                <span className={styles.badge}>{cartCount}</span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Mobile Toggle */}
                <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                    <span className={styles.hamburger}></span>
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className={styles.mobileMenu}>
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={styles.mobileLink}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.label}
                            {item.hasBadge && cartCount > 0 && (
                                <span className={styles.mobileBadge}>({cartCount})</span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
