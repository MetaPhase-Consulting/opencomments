import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { MessageSquare, Users, Shield, Globe, Code, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">About the Platform</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-0">
              <strong>Last Updated:</strong> July 27, 2025
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              OpenComments is a public comment platform designed for transparency, accessibility, and ease of use. 
              We believe that meaningful public participation is essential to democratic governance, and technology 
              should make it easier—not harder—for citizens to engage with their government.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-red-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Built for Democracy</h3>
              </div>
              <p className="text-gray-700">
                Every feature is designed to strengthen the connection between citizens and their government, 
                ensuring that public input is collected efficiently, transparently, and inclusively.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Platform Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Accessible Comment Submission</h3>
                </div>
                <p className="text-gray-700">
                  Intuitive forms with support for attachments, multiple authentication options, 
                  and full accessibility compliance for users with disabilities.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Agency Management Tools</h3>
                </div>
                <p className="text-gray-700">
                  Comprehensive administrative interface for government staff to create dockets, 
                  moderate comments, and export data for analysis.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Shield className="w-8 h-8 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Security & Integrity</h3>
                </div>
                <p className="text-gray-700">
                  Multi-layered security protections including authentication, rate limiting, 
                  CAPTCHA verification, and comprehensive audit logging.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Globe className="w-8 h-8 text-indigo-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Open Data Ready</h3>
                </div>
                <p className="text-gray-700">
                  Built-in export capabilities and API access for researchers, journalists, 
                  and public interest groups to analyze public feedback trends.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-gray-900 mb-4">Design Principles</h2>
            <p className="text-gray-700 mb-6">
              OpenComments follows U.S. Web Design System (USWDS) principles and modern accessibility standards:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Accessibility First</h3>
                  <p className="text-sm text-gray-700">WCAG 2.1 AA compliance with screen reader support and keyboard navigation</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Mobile Responsive</h3>
                  <p className="text-sm text-gray-700">Optimized for all devices from smartphones to desktop computers</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Plain Language</h3>
                  <p className="text-sm text-gray-700">Clear, jargon-free interface that's easy for all citizens to understand</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Performance Optimized</h3>
                  <p className="text-sm text-gray-700">Fast loading times and efficient data handling for large-scale public participation</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technology Stack</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Code className="w-6 h-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Modern Open-Source Technologies</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
                  <ul className="space-y-1">
                    <li>• React 18 with TypeScript</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Responsive design patterns</li>
                    <li>• Progressive web app features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
                  <ul className="space-y-1">
                    <li>• PostgreSQL database</li>
                    <li>• Row-level security (RLS)</li>
                    <li>• Real-time subscriptions</li>
                    <li>• Serverless edge functions</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Serve</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Citizens</h3>
                <p className="text-sm text-gray-700">
                  Individuals and organizations who want to participate in government decision-making
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Government Agencies</h3>
                <p className="text-sm text-gray-700">
                  State, local, and educational institutions seeking efficient public engagement
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Researchers</h3>
                <p className="text-sm text-gray-700">
                  Academics, journalists, and civic organizations analyzing public participation
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Open Source Commitment</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 mb-4">
                OpenComments is proudly open source, ensuring transparency, security, and community collaboration.
              </p>
              <div className="space-y-2 text-green-700">
                <p>• <strong>MIT License:</strong> Free for government agencies to use and modify</p>
                <p>• <strong>Community Driven:</strong> Contributions welcome from developers and civic technologists</p>
                <p>• <strong>Transparent Development:</strong> All code, issues, and roadmap publicly available</p>
                <p>• <strong>No Vendor Lock-in:</strong> Agencies maintain full control of their data and deployment</p>
              </div>
              <div className="mt-4">
                <a 
                  href="https://github.com/brianfunk/opencomments" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-800 hover:text-green-900 underline"
                >
                  <Code className="w-4 h-4 mr-1" />
                  View Source Code on GitHub
                </a>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">For Citizens</h3>
                <p className="text-blue-800 mb-4">
                  Start participating in your local government's decision-making process.
                </p>
                <a 
                  href="/dockets" 
                  className="inline-flex items-center text-blue-700 hover:text-blue-800 underline font-medium"
                >
                  Browse Comment Opportunities →
                </a>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-3">For Government Agencies</h3>
                <p className="text-red-800 mb-4">
                  Learn how to implement OpenComments at your agency.
                </p>
                <a 
                  href="/onboarding" 
                  className="inline-flex items-center text-red-700 hover:text-red-800 underline font-medium"
                >
                  Agency Onboarding Guide →
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;