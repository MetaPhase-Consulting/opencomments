import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { HelpCircle } from 'lucide-react';

const FAQs = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">FAQs</h1>
          <p className="text-lg text-gray-600 mb-8">
            Frequently Asked Questions
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <p className="text-blue-800">
              Coming soon - comprehensive answers to common questions about using OpenComments 
              for both citizens and government agencies.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;

/* 
Future content will include:
- How to submit effective comments
- Agency setup and management questions
- Technical troubleshooting
- Privacy and security concerns
- Data export and analysis
- Accessibility features
*/