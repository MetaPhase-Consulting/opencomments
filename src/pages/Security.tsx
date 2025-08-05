import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { Shield, Lock, Eye, Server, UserCheck, FileCheck } from 'lucide-react';

const Security = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Security</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-0">
              <strong>Last Updated:</strong> July 27, 2025
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Platform Protections</h2>
            <p className="text-gray-700 mb-6">
              OpenComments uses layered protections to ensure comment integrity and prevent misuse:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <UserCheck className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Account Verification</h3>
                </div>
                <p className="text-gray-700">
                  Login required for all comment submissions. Users must verify their accounts 
                  through secure authentication methods including OAuth providers.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Eye className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Activity Logging</h3>
                </div>
                <p className="text-gray-700">
                  IP address, location, and browser agent are recorded per submission 
                  to maintain audit trails and prevent fraudulent activity.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Shield className="w-8 h-8 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">CAPTCHA Protection</h3>
                </div>
                <p className="text-gray-700">
                  CAPTCHA verification enforced on all comment submissions to prevent 
                  automated spam and ensure human participation.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Server className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Rate Limiting</h3>
                </div>
                <p className="text-gray-700">
                  Intelligent rate limits prevent misuse and spam while allowing 
                  legitimate participation from citizens and organizations.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileCheck className="w-8 h-8 text-orange-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Secure File Storage</h3>
                </div>
                <p className="text-gray-700">
                  Files are stored securely with signed URLs, virus scanning, 
                  and strict file type validation to protect against malicious uploads.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Lock className="w-8 h-8 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Data Access Controls</h3>
                </div>
                <p className="text-gray-700">
                  Agency and role-based data access using Row Level Security (RLS) 
                  ensures users can only access data they're authorized to see.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Infrastructure Security</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>HTTPS Encryption:</strong> All data transmission is encrypted using TLS 1.3</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Database Security:</strong> PostgreSQL with encrypted storage and secure connections</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>CDN Protection:</strong> Global content delivery with DDoS protection</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Regular Backups:</strong> Automated daily backups with point-in-time recovery</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Security Monitoring:</strong> 24/7 monitoring for suspicious activity and threats</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compliance Standards</h2>
            <p className="text-gray-700 mb-4">
              OpenComments adheres to government security standards and best practices:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">SOC 2 Type II</h3>
                <p className="text-sm text-blue-800">
                  Infrastructure hosted on SOC 2 compliant platforms with regular audits
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">OWASP Guidelines</h3>
                <p className="text-sm text-green-800">
                  Application security follows OWASP Top 10 protection standards
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Data Encryption</h3>
                <p className="text-sm text-purple-800">
                  Data encrypted at rest and in transit using industry standards
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-orange-900 mb-2">Access Controls</h3>
                <p className="text-sm text-orange-800">
                  Multi-factor authentication and role-based permissions
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Incident Response</h2>
            <p className="text-gray-700 mb-4">
              In the event of a security incident, OpenComments follows a structured response process:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li><strong>Detection:</strong> Automated monitoring systems alert our team immediately</li>
              <li><strong>Assessment:</strong> Security team evaluates the scope and impact</li>
              <li><strong>Containment:</strong> Immediate steps taken to prevent further damage</li>
              <li><strong>Communication:</strong> Affected agencies and users are notified promptly</li>
              <li><strong>Recovery:</strong> Systems restored with additional protections implemented</li>
              <li><strong>Review:</strong> Post-incident analysis to improve future security</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reporting Security Issues</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 mb-4">
                <strong>Security vulnerabilities should be reported immediately.</strong>
              </p>
              <div className="space-y-2 text-red-700">
                <p><strong>Security:</strong> Available through our contact form</p>
                <p><strong>Response Time:</strong> We respond to security reports within 24 hours</p>
                <p><strong>Responsible Disclosure:</strong> We work with researchers to address issues before public disclosure</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Resources</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><a href="/privacy" className="text-blue-700 underline hover:text-blue-800">Privacy Policy</a> - How we handle and protect your data</li>
              <li><a href="/terms" className="text-blue-700 underline hover:text-blue-800">Terms of Service</a> - Usage guidelines and restrictions</li>
              <li><a href="/accessibility" className="text-blue-700 underline hover:text-blue-800">Accessibility Statement</a> - Our commitment to inclusive design</li>
              <li><a href="/contact" className="text-blue-700 underline hover:text-blue-800">Contact Us</a> - Get help or report issues</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Security;