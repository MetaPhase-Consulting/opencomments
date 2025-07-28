import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { usePublicSearch } from '../hooks/usePublicSearch';
import PublicLayout from '../components/PublicLayout';
import { 
  Search, 
  Filter, 
  Calendar, 
  MessageSquare, 
  Clock,
  ChevronDown,
  X,
  AlertCircle
} from 'lucide-react';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { dockets, loading, error, hasMore, total, searchDockets, loadMore, reset } = usePublicSearch();
  
  const [filters, setFilters] = useState({
    query: query,
    status: 'all' as const,
    tags: [] as string[],
    limit: 10,
    offset: 0
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Available tags - in real app, fetch from backend
  const availableTags = [
    'Budget', 'Transportation', 'Housing', 'Environment', 'Public Safety',
    'Parks & Recreation', 'Zoning', 'Economic Development', 'Health', 'Education'
  ];

  useEffect(() => {
    if (query) {
      const searchFilters = { ...filters, query, offset: 0 };
      setFilters(searchFilters);
      reset();
      searchDockets(searchFilters);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, offset: 0 };
    setFilters(newFilters);
    
    // Update URL with search query
    const newSearchParams = new URLSearchParams();
    if (newFilters.query) {
      newSearchParams.set('q', newFilters.query);
    }
    setSearchParams(newSearchParams);
    
    reset();
    searchDockets(newFilters);
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value, offset: 0 };
    setFilters(newFilters);
    reset();
    searchDockets(newFilters);
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    handleFilterChange('tags', newTags);
  };

  const clearFilters = () => {
    const newFilters = { query: '', status: 'all' as const, tags: [], limit: 10, offset: 0 };
    setFilters(newFilters);
    setSearchParams(new URLSearchParams());
    reset();
    searchDockets(newFilters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (closeDate?: string) => {
    if (!closeDate) return null;
    const now = new Date();
    const close = new Date(closeDate);
    const diffTime = close.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: string, closeDate?: string) => {
    const daysRemaining = getDaysRemaining(closeDate);
    
    if (status === 'open') {
      if (daysRemaining === null) {
        return 'bg-green-100 text-green-800';
      } else if (daysRemaining <= 0) {
        return 'bg-red-100 text-red-800';
      } else if (daysRemaining <= 7) {
        return 'bg-yellow-100 text-yellow-800';
      } else {
        return 'bg-green-100 text-green-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, closeDate?: string) => {
    const daysRemaining = getDaysRemaining(closeDate);
    
    if (status === 'open') {
      if (daysRemaining === null) {
        return 'Open';
      } else if (daysRemaining <= 0) {
        return 'Closed';
      } else if (daysRemaining === 1) {
        return 'Closes Tomorrow';
      } else if (daysRemaining <= 7) {
        return `${daysRemaining} Days Left`;
      } else {
        return 'Open';
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <PublicLayout 
      title={`Search Results${query ? ` for "${query}"` : ''} - OpenComments`}
      description="Search results for public comment opportunities"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Results
            {query && (
              <span className="text-gray-600 font-normal"> for "{query}"</span>
            )}
          </h1>
          <p className="text-lg text-gray-600">
            Find public comment opportunities on government proposals and policy changes.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Search by keyword, topic, or agency..."
                aria-label="Search dockets"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                <Filter className="w-4 h-4 mr-1" />
                Advanced Filters
                <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center space-x-4">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filter by status"
                >
                  <option value="all">All Dockets</option>
                  <option value="open">Open for Comments</option>
                  <option value="closed">Recently Closed</option>
                </select>

                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Topics
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            (filters.tags || []).includes(tag)
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {((filters.tags && filters.tags.length > 0) || filters.query) && (
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {filters.query && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            Search: "{filters.query}"
                            <button
                              type="button"
                              onClick={() => {
                                setFilters(prev => ({ ...prev, query: '' }));
                                setSearchParams(new URLSearchParams());
                              }}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )}
                        {(filters.tags || []).map(tag => (
                          <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {tag}
                            <button
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-600">{error}</span>
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && dockets.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {dockets.length} {dockets.length === 1 ? 'result' : 'results'}
              {filters.query && ` for "${filters.query}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && dockets.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && dockets.length === 0 && !error && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results Found</h2>
            {filters.query ? (
              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-6">
                  We couldn't find any comment opportunities matching "{filters.query}".
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Try:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Using different keywords</li>
                    <li>• Checking your spelling</li>
                    <li>• Using broader search terms</li>
                    <li>• Removing filters to see all opportunities</li>
                  </ul>
                </div>
                <div className="mt-6 space-y-3">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                  >
                    Clear search and filters
                  </button>
                  <div>
                    <Link
                      to="/dockets"
                      className="text-blue-700 hover:text-blue-800 underline text-sm"
                    >
                      Browse all comment opportunities
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-6">
                  No comment opportunities match your current filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Grid */}
        {dockets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {dockets.map((docket) => (
              <div key={docket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link 
                          to={`/dockets/${docket.slug}`}
                          className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          {docket.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {docket.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(docket.status, docket.close_at)}`}>
                      {getStatusText(docket.status, docket.close_at)}
                    </span>
                    <span className="text-sm text-gray-500">{docket.agency_name}</span>
                  </div>

                  {docket.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {docket.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {docket.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{docket.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {docket.comment_count} comments
                    </div>
                    {docket.close_at && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Closes {formatDate(docket.close_at)}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to={`/dockets/${docket.slug}`}
                      className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      View Details & Comment
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && dockets.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => loadMore(filters)}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  Loading...
                </>
              ) : (
                'Load More Results'
              )}
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default SearchResults;