import React from 'react'
import { Github, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <>
      {/* Patriotic Ribbon Separator */}
      <div className="h-1 flex">
        <div className="flex-1" style={{ backgroundColor: '#D9253A' }}></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1" style={{ backgroundColor: '#0050D8' }}></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1" style={{ backgroundColor: '#D9253A' }}></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1" style={{ backgroundColor: '#0050D8' }}></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1" style={{ backgroundColor: '#D9253A' }}></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1" style={{ backgroundColor: '#0050D8' }}></div>
      </div>
      
      <footer className="bg-gray-800 text-white">
        {/* Top Section with Logo and Social */}
        <div className="border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center mb-2">
                  <img 
                    src="/OpenComments.png" 
                    alt="OpenComments Logo" 
                    className="w-12 h-12 mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-bold">
                      <span style={{ color: '#D9253A' }}>Open</span>
                      <span style={{ color: '#0050D8' }}>Comments</span>
                    </h3>
                    <p className="text-gray-300 text-sm">Public commenting platform for transparent government</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Follow us:</span>
                <a
                  href="https://github.com/MetaPhase-Consulting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded p-1"
                  aria-label="Follow MetaPhase on GitHub"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href="https://www.linkedin.com/company/metaphase-consulting-llc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded p-1"
                  aria-label="Follow MetaPhase on LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/accessibility"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Accessibility support
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Terms of service
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/contact"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Contact us
                  </a>
                </li>
                <li>
                  <a
                    href="/api"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    API documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://status.opencomments.us"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    System status
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Government</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/agencies"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Agency portal
                  </a>
                </li>
                <li>
                  <a
                    href="/compliance"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Compliance
                  </a>
                </li>
                <li>
                  <a
                    href="/security"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/contact"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Contact us
                  </a>
                </li>
                <li>
                  <a
                    href="/feedback"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Send feedback
                  </a>
                </li>
                <li>
                  <a
                    href="/training"
                    className="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline"
                  >
                    Training resources
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
              <div className="flex items-center mb-4 md:mb-0">
                <Github className="w-4 h-4 mr-2" />
                <span>Open Source</span>
                <span className="mx-3">|</span>
                <span>Built by </span>
                <a 
                  href="https://metaphase.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded ml-1"
                >
                  MetaPhase
                </a>
              </div>
              
              <div className="text-center md:text-right">
                <p>Looking for U.S. government information and services? Visit <a href="https://usa.gov" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded">USA.gov</a></p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
