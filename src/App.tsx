import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import DocketList from './pages/agency/DocketList';
import DocketWizard from './pages/agency/DocketWizard';
import AgencyDocketDetail from './pages/agency/DocketDetail';
import ModerationQueue from './pages/agency/ModerationQueue';
import AgencySettings from './pages/agency/AgencySettings';
import GlobalSearch from './pages/agency/GlobalSearch';
import Reports from './pages/agency/Reports';
import Unauthorized from './pages/Unauthorized';
import Contact from './pages/Contact';
import PlatformAdmin from './pages/platform/PlatformAdmin';
import DocketBrowse from './pages/public/DocketBrowse';
import PublicDocketDetail from './pages/public/DocketDetail';
import CommentWizard from './pages/public/CommentWizard';
import ThankYou from './pages/public/ThankYou';
import SearchResults from './pages/SearchResults';
import CommentSearch from './pages/public/CommentSearch';
import CommentDetail from './pages/public/CommentDetail';
import AgencyProfile from './pages/public/AgencyProfile';
import StatePage from './pages/public/StatePage';
import Security from './pages/Security';
import About from './pages/About';
import Onboarding from './pages/Onboarding';
import FAQs from './pages/FAQs';
import UserGuide from './pages/UserGuide';
import DataAccess from './pages/DataAccess';
import Status from './pages/Status';

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
            <Route path="/contact" element={<Contact />} />
            <Route path="/security" element={<Security />} />
            <Route path="/about" element={<About />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/join-onboard" element={<Onboarding />} />
            <Route path="/new-onboarding" element={<Onboarding />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/user-admin-guide" element={<UserGuide />} />
            <Route path="/user-guide" element={<UserGuide />} />
            <Route path="/government-user-guide" element={<UserGuide />} />
            <Route path="/data-access" element={<DataAccess />} />
            <Route path="/status" element={<Status />} />
            <Route path="/dockets" element={<DocketBrowse />} />
            <Route path="/dockets/:slug" element={<PublicDocketDetail />} />
            <Route path="/state/:stateCode" element={<StatePage />} />
            <Route path="/agencies/:slug" element={<AgencyProfile />} />
            <Route path="/dockets/:slug/comment" element={<CommentWizard />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/comments/search" element={<CommentSearch />} />
            <Route path="/comments/:id" element={<CommentDetail />} />
            <Route path="/search" element={<Navigate to="/comments/search" replace />} />
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
            <Route path="/agency" element={<Navigate to="/agency/login" replace />} />
            <Route path="/agency/dashboard" element={
              <AgencyProtectedRoute>
                <AgencyDashboardNew />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/threads" element={
              <AgencyProtectedRoute>
                <DocketList />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/threads/new" element={
              <AgencyProtectedRoute>
                <DocketWizard />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/dockets" element={
              <AgencyProtectedRoute>
                <DocketList />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/dockets/new" element={
              <AgencyProtectedRoute>
                <DocketWizard />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/dockets/:id" element={
              <AgencyProtectedRoute>
                <AgencyDocketDetail />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/dockets/:id/edit" element={
              <AgencyProtectedRoute>
                <DocketWizard />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/moderation" element={
              <AgencyProtectedRoute>
                <ModerationQueue />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/moderation/queue" element={
              <AgencyProtectedRoute>
                <ModerationQueue />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/moderation/flagged" element={
              <AgencyProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Flagged Items</h1>
                  <p className="text-gray-600">Flagged content management coming soon</p>
                </div>
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/search" element={
              <AgencyProtectedRoute>
                <GlobalSearch />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/reports" element={
              <AgencyProtectedRoute>
                <Reports />
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/users" element={
              <AgencyProtectedRoute>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Users & Roles</h1>
                  <p className="text-gray-600">User management coming soon</p>
                </div>
              </AgencyProtectedRoute>
            } />
            <Route path="/agency/settings" element={
              <AgencyProtectedRoute>
                <AgencySettings />
              </AgencyProtectedRoute>
            } />
            
            {/* Platform Admin Routes */}
            <Route path="/platform-admin" element={<PlatformAdmin />} />
          </Routes>
        </Router>
      </AgencyProvider>
    </AuthProvider>
  );
}

export default App;