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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Government Agencies</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">How do I set up my agency?</h4>
                  <p className="text-sm text-gray-600">Contact us to get started with agency setup and user training.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Is OpenComments secure?</h4>
                  <p className="text-sm text-gray-600">Yes, we use enterprise-grade security with SOC 2 compliance and government-standard data protection.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Can I export comment data?</h4>
                  <p className="text-sm text-gray-600">Yes, you can export comments as CSV files and attachments as ZIP bundles for archival and analysis.</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Citizens</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">How do I submit a comment?</h4>
                  <p className="text-sm text-gray-600">Create an account, find the relevant docket, and submit your feedback through the comment form.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Are my comments public?</h4>
                  <p className="text-sm text-gray-600">Yes, approved comments become part of the public record, but your email address remains private.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Can I track my submissions?</h4>
                  <p className="text-sm text-gray-600">Yes, your dashboard shows all submitted comments and their approval status.</p>
                </div>
              </div>
            </div>
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