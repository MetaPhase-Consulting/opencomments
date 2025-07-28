import React from 'react';
import { Search, ChevronDown, Filter, X } from 'lucide-react';

const Hero = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [filters, setFilters] = React.useState({
    agency_name: '',
    state: '',
    date_from: '',
    date_to: '',
    commenter_type: '',
    position: ''
  });

  // Available filter options
  const stateOptions = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
    'Wisconsin', 'Wyoming', 'District of Columbia'
  ]

  const commenterTypeOptions = [
    { value: 'individual', label: 'Individual' },
    { value: 'organization', label: 'Organization' },
    { value: 'agent', label: 'Agent/Representative' },
    { value: 'anonymous', label: 'Anonymous' }
  ]

  const positionOptions = [
    { value: 'support', label: 'Support' },
    { value: 'oppose', label: 'Oppose' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'unclear', label: 'Unclear' },
    { value: 'not_specified', label: 'Not Specified' }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search URL with query and filters
    const searchParams = new URLSearchParams();
    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery.trim());
    }
    if (filters.agency_name) searchParams.set('agency_name', filters.agency_name);
    if (filters.state) searchParams.set('state', filters.state);
    if (filters.date_from) searchParams.set('date_from', filters.date_from);
    if (filters.date_to) searchParams.set('date_to', filters.date_to);
    if (filters.commenter_type) searchParams.set('commenter_type', filters.commenter_type);
    if (filters.position) searchParams.set('position', filters.position);
    
    window.location.href = `/comments/search?${searchParams.toString()}`;
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      agency_name: '',
      state: '',
      date_from: '',
      date_to: '',
      commenter_type: '',
      position: ''
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '');
  };


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
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Search public comments..."
                aria-label="Search public comments"
              />
            </div>
            
            {/* Advanced Search Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                <Filter className="w-4 h-4 mr-1" />
                Advanced Search
                <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search Comments
              </button>
            </div>
            
            {/* Advanced Search Panel */}
            {showAdvanced && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-left">
                <div className="space-y-4">
                  {/* Agency and State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Agency
                      </label>
                      <input
                        type="text"
                        id="agency_name"
                        value={filters.agency_name}
                        onChange={(e) => updateFilter('agency_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Department of Transportation"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        id="state"
                        value={filters.state}
                        onChange={(e) => updateFilter('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All States</option>
                        {stateOptions.map(state => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        id="date_from"
                        value={filters.date_from}
                        onChange={(e) => updateFilter('date_from', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        id="date_to"
                        value={filters.date_to}
                        onChange={(e) => updateFilter('date_to', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Commenter Type and Position */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="commenter_type" className="block text-sm font-medium text-gray-700 mb-1">
                        Commenter Type
                      </label>
                      <select
                        id="commenter_type"
                        value={filters.commenter_type}
                        onChange={(e) => updateFilter('commenter_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        {commenterTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <select
                        id="position"
                        value={filters.position}
                        onChange={(e) => updateFilter('position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Positions</option>
                        {positionOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Filters and Clear */}
                  {hasActiveFilters() && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="text-sm text-blue-700 hover:text-blue-800 underline"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) => {
                          if (!value) return null;
                          const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                              {label}: {value}
                              <button
                                type="button"
                                onClick={() => updateFilter(key, '')}
                                className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
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
                  href="/dockets"
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium border-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-blue-50"
                  style={{ 
                    borderColor: '#0050D8', 
                    color: '#0050D8'
                  }}
                >
                  Browse Dockets
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