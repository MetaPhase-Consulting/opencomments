import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-0">
              <strong>Last Updated:</strong> July 26, 2025
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using OpenComments, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use of the Service</h2>
            <p className="text-gray-700 mb-4">
              OpenComments is a platform for submitting public comments on government dockets. 
              You agree to use this service only for lawful purposes and in accordance with these Terms.
            </p>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Impersonate another person or entity</li>
              <li>Submit content that is defamatory, obscene, or harassing</li>
              <li>Attempt to disrupt or interfere with the service</li>
              <li>Use automated systems to submit comments</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Public Comments</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium">
                <strong>Important:</strong> All comments submitted become part of the public record.
              </p>
            </div>
            <p className="text-gray-700 mb-4">
              By submitting a comment through OpenComments, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Your comment will be publicly visible and searchable</li>
              <li>Your comment may be shared with relevant government agencies</li>
              <li>You retain responsibility for the content of your comments</li>
              <li>Comments may be subject to government record retention policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and current information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              OpenComments is provided "as is" without warranties of any kind. We shall not be 
              liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifications</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting. Your continued use of the service constitutes acceptance 
              of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700">
              Questions about these Terms of Service should be sent to{' '}
              <a href="mailto:legal@opencomments.us" className="text-blue-700 underline hover:text-blue-800">
                legal@opencomments.us
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;