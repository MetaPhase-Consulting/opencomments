import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { Building2, CheckCircle, Mail, Users, Settings, FileText } from 'lucide-react';

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Onboarding for Government Agencies</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-0">
              <strong>Last Updated:</strong> July 27, 2025
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Want to use OpenComments at your agency?</h2>
            <p className="text-gray-700 mb-6">
              OpenComments is designed to help government agencies collect, manage, and publish public comments 
              efficiently and transparently. Our platform streamlines the public participation process while 
              maintaining the highest standards of security and accessibility.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Building2 className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-green-900">Free for Government Use</h3>
              </div>
              <p className="text-green-800">
                OpenComments is provided at no cost to eligible government agencies as part of our 
                commitment to strengthening democratic participation.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started Process</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Eligibility</h3>
                  <p className="text-gray-700 mb-3">
                    State, local, and educational agencies are eligible to use OpenComments. 
                    This includes cities, counties, school districts, and state departments.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Eligible Agency Types:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Municipal governments (cities, towns, villages)</li>
                      <li>• County and parish governments</li>
                      <li>• State agencies and departments</li>
                      <li>• School districts and educational institutions</li>
                      <li>• Special districts (water, transit, etc.)</li>
                      <li>• Regional planning organizations</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit a Request</h3>
                  <p className="text-gray-700 mb-3">
                    Use our contact form to request access. Please include your agency domain 
                    (e.g., @cityname.gov) and a brief description of your comment needs.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Information to Include:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Agency name and jurisdiction</li>
                      <li>• Primary contact person and title</li>
                      <li>• Official government email domain</li>
                      <li>• Types of comment periods you plan to run</li>
                      <li>• Expected volume of public participation</li>
                    </ul>
                  </div>
                  <div className="mt-4">
                    <a 
                      href="/contact" 
                      className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Submit Access Request
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Process</h3>
                  <p className="text-gray-700 mb-3">
                    Our team will confirm your agency's eligibility and initiate the setup process. 
                    This typically takes 1-2 business days.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-yellow-900 mb-2">What We Verify:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Government domain ownership</li>
                      <li>• Agency legitimacy and public status</li>
                      <li>• Contact person authorization</li>
                      <li>• Compliance with platform terms</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Setup & Training</h3>
                  <p className="text-gray-700 mb-3">
                    You'll receive login credentials and access to your agency portal. We provide 
                    comprehensive training to get your team up and running quickly.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Users className="w-5 h-5 text-green-600 mr-2" />
                        <h4 className="text-sm font-semibold text-green-900">Team Training</h4>
                      </div>
                      <p className="text-sm text-green-800">
                        Live training sessions for your staff on platform features and best practices
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Settings className="w-5 h-5 text-purple-600 mr-2" />
                        <h4 className="text-sm font-semibold text-purple-900">Custom Configuration</h4>
                      </div>
                      <p className="text-sm text-purple-800">
                        Platform customized with your agency branding and workflow preferences
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What You Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Dedicated Agency Portal</h3>
                    <p className="text-sm text-gray-700">Your own subdomain (e.g., yourtown.opencomments.us)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-700">Role-based access for staff with different permission levels</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Comment Moderation</h3>
                    <p className="text-sm text-gray-700">Tools to review, approve, and manage public submissions</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Data Export</h3>
                    <p className="text-sm text-gray-700">Export comments and attachments for analysis and archival</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Analytics Dashboard</h3>
                    <p className="text-sm text-gray-700">Track participation metrics and engagement trends</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Security Features</h3>
                    <p className="text-sm text-gray-700">Built-in protections against spam and fraudulent submissions</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Ongoing Support</h3>
                    <p className="text-sm text-gray-700">Technical assistance and platform updates at no additional cost</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Accessibility Compliance</h3>
                    <p className="text-sm text-gray-700">WCAG 2.1 AA compliant interface for all users</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Next Steps</h2>
            <p className="text-gray-700 mb-6">
              Once your agency is set up, you'll want to familiarize yourself with the platform features:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-blue-900 mb-2">User Guide</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Comprehensive documentation for managing dockets and moderation
                </p>
                <a href="/user-guide" className="text-blue-700 hover:text-blue-800 underline text-sm">
                  Read the Guide →
                </a>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-green-900 mb-2">Training Resources</h3>
                <p className="text-sm text-green-800 mb-3">
                  Video tutorials and best practices for public engagement
                </p>
                <a href="/contact" className="text-green-700 hover:text-green-800 underline text-sm">
                  Schedule Training →
                </a>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Ongoing Support</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Get help with technical questions or platform features
                </p>
                <a href="/contact" className="text-purple-700 hover:text-purple-800 underline text-sm">
                  Contact Support →
                </a>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does setup take?</h3>
                <p className="text-gray-700">
                  Most agencies are up and running within one week of submitting their request. 
                  Complex customizations may take additional time.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there really no cost?</h3>
                <p className="text-gray-700">
                  OpenComments is provided free to government agencies as a public service. 
                  There are no licensing fees, setup costs, or hidden charges.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What about data ownership?</h3>
                <p className="text-gray-700">
                  Your agency retains full ownership of all comment data. You can export 
                  your data at any time and are not locked into the platform.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can we customize the appearance?</h3>
                <p className="text-gray-700">
                  Yes, we can customize colors, logos, and certain interface elements to 
                  match your agency's branding while maintaining accessibility standards.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">Ready to Get Started?</h2>
              <p className="text-blue-800 mb-6">
                Join the growing number of agencies using OpenComments to engage their communities 
                more effectively and transparently.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Request Agency Access
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Onboarding;