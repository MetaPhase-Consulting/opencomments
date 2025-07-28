import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { BookOpen } from 'lucide-react';

const UserGuide = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">User Guide</h1>
          <p className="text-lg text-gray-600 mb-8">
            Agency Admin Guide
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <p className="text-green-800">
              Coming soon - comprehensive documentation for agency administrators on how to create 
              and manage comment periods, moderate submissions, and export data for analysis.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserGuide;

/* 
Future content will include:
- Creating and configuring dockets
- Managing user roles and permissions
- Comment moderation workflows
- Data export and reporting
- Best practices for public engagement
- Troubleshooting common issues
*/