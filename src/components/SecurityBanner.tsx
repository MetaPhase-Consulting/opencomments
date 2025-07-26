import React from 'react';
import { ChevronDown, Shield, Lock } from 'lucide-react';

const SecurityBanner = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-lg mr-3">🇺🇸</span>
            </div>
            <div className="text-sm text-gray-700">
              <span className="hidden sm:inline">A public commenting platform providing transparency for local governments.</span>
              <span className="sm:hidden text-xs">Public commenting platform for transparent government</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-xs sm:text-sm text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          >
            How you know it's secure
            <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {isExpanded && (
          <div className="pb-4 border-t border-blue-200 mt-3 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Secure platform
                  </h4>
                  <p className="text-sm text-gray-600">
                    OpenComments uses industry-standard security practices to protect your information and ensure the integrity of public comments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    HTTPS encryption
                  </h4>
                  <p className="text-sm text-gray-600">
                    A lock (<Lock className="inline w-3 h-3" />) or <strong>https://</strong> means you've safely connected to the OpenComments website. Share sensitive information only on official, secure websites.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityBanner;