import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
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
      </Routes>
    </Router>
  );
}

export default App;