import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AgencyProvider } from './contexts/AgencyContext';
import ProtectedRoute from './components/ProtectedRoute';
import AgencyProtectedRoute from './components/AgencyProtectedRoute';
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
import AgencyLoginNew from './pages/agency/AgencyLogin';
import AgencySelect from './pages/agency/AgencySelect';
import AgencyNoAccess from './pages/agency/AgencyNoAccess';
import AgencyDashboardNew from './pages/agency/AgencyDashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <AgencyProvider>
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
            
            {/* New Agency Admin Routes */}
            <Route path="/agency/login" element={<AgencyLoginNew />} />
            <Route path="/agency/select" element={<AgencySelect />} />
            <Route path="/agency/no-access" element={<AgencyNoAccess />} />
            <Route path="/agency/dashboard" element={
              <AgencyProtectedRoute>
                <AgencyDashboardNew />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/threads" element={
              <AgencyProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Threads</h1>
                  <p className="text-gray-600">Thread management coming soon</p>
                </div>
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/moderation" element={
              <AgencyProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Moderation</h1>
                  <p className="text-gray-600">Comment moderation coming soon</p>
                </div>
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/users" element={
              <AgencyProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Users</h1>
                  <p className="text-gray-600">User management coming soon</p>
                </div>
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/settings" element={
              <AgencyProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                  <p className="text-gray-600">Agency settings coming soon</p>
                </div>
              </AgencyProtectedRoute>
            } />
          </Routes>
        </Router>
      </AgencyProvider>
    </AuthProvider>
  );
}

export default App;