import React from 'react';
import SecurityBanner from './components/SecurityBanner';
import Header from './components/Header';
import Hero from './components/Hero';
import StateDirectory from './components/StateDirectory';
import FeatureHighlights from './components/FeatureHighlights';
import CalloutBanner from './components/CalloutBanner';
import Footer from './components/Footer';

function App() {
  return (
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
  );
}

export default App;