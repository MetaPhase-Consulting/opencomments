import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SecurityBanner from './components/SecurityBanner';
import Header from './components/Header';
import Hero from './components/Hero';
import StateDirectory from './components/StateDirectory';
import FeatureHighlights from './components/FeatureHighlights';
import CalloutBanner from './components/CalloutBanner';
import Footer from './components/Footer';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Accessibility from './pages/Accessibility';
import PublicLogin from './pages/PublicLogin';
import AgencyLogin from './pages/AgencyLogin';
import PublicDashboard from './pages/PublicDashboard';
import AgencyDashboard from './pages/AgencyDashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-white font-sans">
              <SecurityBanner />
              <Header />
              <main>
                <Hero />
                <StateDirectory />
                <FeatureHighlights />
                <CalloutBanner />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/login" element={<PublicLogin />} />
          <Route path="/agency-login" element={<AgencyLogin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="public">
              <PublicDashboard />
            </ProtectedRoute>
          } />
          <Route path="/agency-dashboard" element={
            <ProtectedRoute requiredRole="agency">
              <AgencyDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;