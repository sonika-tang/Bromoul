import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import styles from './Navbar.module.css';
import Logo from '../assets/Bromoul-logo.png';

const Navbar = () => {
    const [lang, setLang] = useState('en'); // 'en' or 'km'
    const [isOpen, setIsOpen] = useState(false);

    const toggleLang = () => {
        setLang(prev => prev === 'en' ? 'km' : 'en');
    };

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <Link to="/" className={styles.logo}>
                    <img src={Logo} alt="Bromoul Logo" style={{ height: '40px' }} />
                </Link>

                {/* Desktop Menu */}
                <div className={styles.desktopMenu}>
                    <Link to="/" className={styles.navLink}>ទំព័រដើម</Link>
                    <Link to="/marketplace" className={styles.navLink}>ផ្សារ</Link>
                    <Link to="/logistics" className={styles.navLink}>ដឹកជញ្ជូន</Link>
                    {/* Meatika removed */}

                    <div className={styles.actions}>
                        {/* Lang toggle reserved if needed, hidden for now since default is Khmer */}
                        {/* <button onClick={toggleLang} className={styles.langToggle}>
                            {lang === 'en' ? 'KH' : 'EN'}
                        </button> */}
                        <Link to="/farmer-dashboard">
                            <Button variant="outline" className={styles.navBtn}>កសិករ</Button>
                        </Link>
                        <Link to="/buyer-dashboard">
                            <Button variant="primary" className={styles.navBtn}>អ្នកទិញ</Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button className={styles.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
                    <span className={styles.hamburger}></span>
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className={styles.mobileMenu}>
                    <Link to="/" className={styles.mobileLink} onClick={() => setIsOpen(false)}>ទំព័រដើម</Link>
                    <Link to="/marketplace" className={styles.mobileLink} onClick={() => setIsOpen(false)}>ផ្សារ</Link>
                    <Link to="/logistics" className={styles.mobileLink} onClick={() => setIsOpen(false)}>ដឹកជញ្ជូន</Link>
                    <div className={styles.mobileActions}>
                        <Link to="/farmer-dashboard" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" fullWidth>ផ្ទាំងគ្រប់គ្រងកសិករ</Button>
                        </Link>
                        <Link to="/buyer-dashboard" onClick={() => setIsOpen(false)}>
                            <Button variant="primary" fullWidth>ផ្ទាំងគ្រប់គ្រងអ្នកទិញ</Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
