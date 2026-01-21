import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { db } from './services/mockDB';

// Pages
import LandingPage from './pages/LandingPage';
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
  const [currentRole, setCurrentRole] = useState(db.getCurrentRole());
  const [currentUser, setCurrentUser] = useState(db.getCurrentUser());

  useEffect(() => {
    // Listen for role changes
    const handleRoleChange = () => {
      setCurrentRole(db.getCurrentRole());
      setCurrentUser(db.getCurrentUser());
    };

    window.addEventListener('roleChanged', handleRoleChange);
    return () => window.removeEventListener('roleChanged', handleRoleChange);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="app-layout">
        <Navbar userRole={currentRole} user={currentUser} />
        <main className="main-content" style={{ minHeight: '80vh', paddingBottom: '2rem' }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/psar" element={<Marketplace userRole={currentRole} user={currentUser} />} />
            <Route path="/vipheak" element={<AnalyticsPage />} />
            <Route path="/cart" element={<CartPage userRole={currentRole} user={currentUser} />} />
            <Route path="/chat" element={<Messaging user={currentUser} />} />
            <Route path="/profile" element={<ProfilePage user={currentUser} onRoleChange={() => setCurrentRole(db.getCurrentRole())} />} />
          </Routes>
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#f9f9f9',
          color: '#666',
          borderTop: '1px solid #eee',
          marginTop: 'auto'
        }}>
          <p>© 2026 ប្រមូល។ កសិកម្មដើម្បីទាំងអស់គ្នា។</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;