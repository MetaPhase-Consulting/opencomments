import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Accessibility Statement</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-0">
              <strong>Last Updated:</strong> January 2025
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
            <p className="text-gray-700">
              OpenComments is committed to ensuring digital accessibility for people with disabilities. 
              We are continually improving the user experience for everyone and applying the relevant 
              accessibility standards to ensure we provide equal access to all users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Standards</h2>
            <p className="text-gray-700 mb-4">
              OpenComments strives to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 
              Level AA standards and follows the U.S. Web Design System (USWDS) accessibility guidelines.
            </p>
            <p className="text-gray-700 mb-4">Our accessibility features include:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Keyboard navigation support</li>
              <li>Screen reader compatibility</li>
              <li>High contrast color schemes</li>
              <li>Descriptive alt text for images</li>
              <li>Clear heading structure</li>
              <li>Focus indicators for interactive elements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Assistive Technologies</h2>
            <p className="text-gray-700 mb-4">
              OpenComments is designed to be compatible with assistive technologies, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
              <li>Voice recognition software</li>
              <li>Keyboard-only navigation</li>
              <li>Browser zoom functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Known Issues</h2>
            <p className="text-gray-700 mb-4">
              We are aware of some accessibility challenges and are actively working to address them:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Some PDF documents may not be fully accessible</li>
              <li>Complex data tables may require additional navigation support</li>
              <li>Some third-party embedded content may have accessibility limitations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Alternative Formats</h2>
            <p className="text-gray-700">
              If you encounter content that is not accessible or need information in an alternative 
              format, please contact us. We will work to provide the information in a format that 
              meets your needs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Feedback</h2>
            <p className="text-gray-700 mb-4">
              We welcome your feedback on the accessibility of OpenComments. Please let us know if 
              you encounter accessibility barriers:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:accessibility@opencomments.us" className="text-blue-700 underline hover:text-blue-800">
                  accessibility@opencomments.us
                </a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Phone:</strong> 1-800-COMMENTS (1-800-266-6368)
              </p>
              <p className="text-gray-700 mb-0">
                <strong>Response Time:</strong> We aim to respond to accessibility feedback within 2 business days.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ongoing Efforts</h2>
            <p className="text-gray-700">
              We regularly review our website's accessibility and make improvements. Our development 
              team receives accessibility training and we conduct regular accessibility audits to 
              identify and address potential issues.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Accessibility;