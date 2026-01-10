import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Marketplace from './pages/Marketplace';
import Logistics from './pages/Logistics';
import Messaging from './pages/Messaging';
import styles from './styles/App.module.css';

function App() {
  return (
    <Router>
      <div className={styles.app}>
        <Navbar />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Placeholders for other routes */}
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/logistics" element={<Logistics />} />
            {/* Meatika removed */}
            <Route path="/messages" element={<Messaging />} />
            <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          </Routes>
        </main>
        <footer className={styles.footer}>
          <div className="container text-center">
            <p>&copy; 2024 Bromoul. Connecting Farmers and Buyers.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
