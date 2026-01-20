
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserSwitcher from './components/UserSwitcher';

// Pages
import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Marketplace from './pages/Marketplace';
import CartPage from './pages/CartPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import Messaging from './pages/Messaging';

// Scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

function App() {
    return (
        <Router>
            <ScrollToTop />
            <div className="app-layout">
                <Navbar />
                <UserSwitcher />
                <main className="main-content" style={{ minHeight: '80vh', paddingBottom: '2rem' }}>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                        <Route path="/psar" element={<Marketplace />} />
                        <Route path="/vipheak" element={<AnalyticsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/chat" element={<Messaging />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Routes>
                </main>

                {/* Footer Placeholder - Can be added later */}
                <footer style={{
                    textAlign: 'center',
                    padding: '2rem',
                    backgroundColor: '#f9f9f9',
                    color: '#666',
                    borderTop: '1px solid #eee'
                }}>
                    <p>© 2024 Bromoul. កសិកម្មដើម្បីទាំងអស់គ្នា។</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
