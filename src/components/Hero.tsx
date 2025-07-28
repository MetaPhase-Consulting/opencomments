import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const Hero = () => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          <span style={{ color: '#D9253A' }}>Open</span>
          <span style={{ color: '#0050D8' }}>Comments</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Find and submit public comments on state & local government proposals.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Search all comment dockets…"
              aria-label="Search all comment dockets"
            />
          </div>
          
          {/* Advanced Search Toggle */}
          <div className="mt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Advanced Search
              <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Advanced Search Panel */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="agency" className="block text-sm font-medium text-gray-700 mb-1">
                    Agency
                  </label>
                  <input
                    type="text"
                    id="agency"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Department of Transportation"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    id="state"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All States</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                    <option value="NY">New York</option>
                    {/* Add more states as needed */}
                  </select>
                </div>
                <div>
                  <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                    Comment Period From
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                    Comment Period To
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action Buttons */}
        <div className="flex justify-center">
          <a
            href="/dockets"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-blue-800"
            style={{ backgroundColor: '#0050D8' }}
          >
            Browse Comment Opportunities
          </a>
        </div>
        
        {/* Commenting Information */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="flex-shrink-0">
                <img 
                  src="/OpenComments.png" 
                  alt="OpenComments Logo" 
                  className="w-20 h-20"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Submit Official Comments
                </h3>
                <p className="text-gray-700 mb-4">
                  Comments are submitted on specific dockets (comment periods). First find the docket you want to comment on, then create an account to submit your official comment.
                </p>
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium border-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-blue-50"
                  style={{ 
                    borderColor: '#0050D8', 
                    color: '#0050D8'
                  }}
                >
                  Create Account to Comment
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;