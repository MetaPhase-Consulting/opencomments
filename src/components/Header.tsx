import React from 'react';
import { Search, MessageSquare, ChevronDown } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedState, setSelectedState] = React.useState('');
  const [showStateDropdown, setShowStateDropdown] = React.useState(false);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode);
    setShowStateDropdown(false);
    window.location.href = `https://${stateCode.toLowerCase()}.opencomments.us`;
  };

  return (
    <header className="shadow-sm">
      {/* Main Navigation */}
      <div className="bg-blue-100 text-gray-800 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">
                <span style={{ color: '#D9253A' }}>Open</span>
                <span style={{ color: '#0050D8' }}>Comments</span>
              </h1>
            </div>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-32 pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Search"
                    aria-label="Search dockets"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  >
                    <Search className="h-4 w-4 text-gray-400 hover:text-blue-700" />
                  </button>
                </div>
              </form>

              {/* State Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStateDropdown(!showStateDropdown)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {selectedState ? states.find(s => s.code === selectedState)?.name : 'Select State'}
                  <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showStateDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showStateDropdown && (
                  <div className="absolute z-50 left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {states.map((state) => (
                      <button
                        key={state.code}
                        onClick={() => handleStateSelect(state.code)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors duration-150 text-sm"
                      >
                        <span className="text-gray-900">{state.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right Navigation */}
            <div className="flex items-center space-x-4">
              <a
                href="/agency-login"
                className="px-4 py-2 text-sm font-medium border-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  color: '#D9253A', 
                  borderColor: '#D9253A'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D9253A';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#D9253A';
                }}
              >
                Agency Login
              </a>
              <a
                href="/login"
                className="px-4 py-2 text-sm font-medium text-blue-700 border-2 border-blue-700 rounded hover:bg-blue-700 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Public Login
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded={showMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {showMobileMenu ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-blue-100">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Search dockets..."
                    aria-label="Search dockets"
                  />
                </div>
              </form>

              {/* Mobile State Selection */}
              <div>
                <label htmlFor="mobile-state-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select State
                </label>
                <select
                  id="mobile-state-select"
                  value={selectedState}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select a state...</option>
                  {states.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Auth Links */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <a
                  href="/agency-login"
                  className="block w-full px-4 py-2 text-center text-sm font-medium border-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    color: '#D9253A', 
                    borderColor: '#D9253A'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D9253A';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#D9253A';
                  }}
                >
                  Agency Login
                </a>
                <a
                  href="/login"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-blue-700 border-2 border-blue-700 rounded hover:bg-blue-700 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Public Login
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Patriotic Ribbon */}
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
    </header>
  );
};

export default Header;