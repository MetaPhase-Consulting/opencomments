import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { Database } from 'lucide-react';

const DataAccess = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Access & API</h1>
          <p className="text-lg text-gray-600 mb-8">
            Resources for civic tech, researchers, and nonprofits
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-8">
            <p className="text-purple-800">
              Coming soon - API documentation and bulk data access tools for researchers, 
              journalists, and civic organizations to analyze public participation trends.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DataAccess;

/* 
Future content will include:
- REST API documentation
- GraphQL endpoint information
- Bulk data export formats
- Rate limiting and authentication
- Example queries and use cases
- Data dictionary and schema
*/