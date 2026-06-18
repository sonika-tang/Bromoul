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
import RoleSelectPage from './pages/RoleSelectPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppShell = ({ currentRole, currentUser, onRoleChange }) => {
  const { pathname } = useLocation();
  const isChat = pathname === '/chat';

  return (
    <div className="app-layout">
      <Navbar userRole={currentRole} user={currentUser} />
      <main
        className="main-content"
        style={isChat ? {} : { minHeight: '80vh', paddingBottom: '2rem' }}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/psar" element={<Marketplace userRole={currentRole} user={currentUser} />} />
          <Route path="/vipheak" element={<AnalyticsPage />} />
          <Route path="/cart" element={<CartPage userRole={currentRole} user={currentUser} />} />
          <Route path="/chat" element={<Messaging key={currentUser?.id} user={currentUser} />} />
          <Route path="/profile" element={<ProfilePage user={currentUser} onRoleChange={onRoleChange} />} />
        </Routes>
      </main>
      {!isChat && (
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
      )}
    </div>
  );
};

function App() {
  const [currentRole, setCurrentRole] = useState(db.getCurrentRole());
  const [currentUser, setCurrentUser] = useState(db.getCurrentUser());

  const syncRole = () => {
    setCurrentRole(db.getCurrentRole());
    setCurrentUser(db.getCurrentUser());
  };

  useEffect(() => {
    window.addEventListener('roleChanged', syncRole);
    return () => window.removeEventListener('roleChanged', syncRole);
  }, []);

  if (!currentRole) {
    return <RoleSelectPage onSelect={(role) => { db.setCurrentRole(role); syncRole(); }} />;
  }

  return (
    <Router>
      <ScrollToTop />
      <AppShell
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={syncRole}
      />
    </Router>
  );
}

export default App;