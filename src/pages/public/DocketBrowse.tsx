import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePublicBrowse, DocketSearchFilters } from '../../hooks/usePublicBrowse'
import PublicLayout from '../../components/PublicLayout'
import { 
  Search, 
  Filter, 
  Calendar, 
  MessageSquare, 
  Clock,
  ChevronDown,
  X,
  Building2,
  AlertCircle
} from 'lucide-react'

const DocketBrowse = () => {
  const { dockets, loading, error, hasMore, total, browseDockets, loadMore, reset } = usePublicBrowse()
  const [filters, setFilters] = useState<DocketSearchFilters>({
    query: '',
    status: 'all',
    tags: [],
    sort_by: 'newest',
    limit: 20,
    offset: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  // Available options
  const availableTags = [
    'Budget', 'Transportation', 'Housing', 'Environment', 'Public Safety',
    'Parks & Recreation', 'Zoning', 'Economic Development', 'Health', 'Education'
  ]

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

  const sortOptions = [
    { value: 'newest', label: 'Newest Opened' },
    { value: 'closing', label: 'Closest Closing' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'agency', label: 'Agency A-Z' }
  ]

  useEffect(() => {
    browseDockets(filters)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, offset: 0 }
    setFilters(newFilters)
    reset()
    browseDockets(newFilters)
  }

  const handleFilterChange = (key: keyof DocketSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, offset: 0 }
    setFilters(newFilters)
    reset()
    browseDockets(newFilters)
  }

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    handleFilterChange('tags', newTags)
  }

  const clearFilters = () => {
    const newFilters = { 
      query: '', 
      status: 'all' as const, 
      tags: [], 
      sort_by: 'newest' as const,
      limit: 20, 
      offset: 0 
    }
    setFilters(newFilters)
    reset()
    browseDockets(newFilters)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (closeDate?: string) => {
    if (!closeDate) return null
    const now = new Date()
    const close = new Date(closeDate)
    const diffTime = close.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (status: string, closeDate?: string) => {
    const daysRemaining = getDaysRemaining(closeDate)
    
    if (status === 'open') {
      if (daysRemaining === null) {
        return 'bg-green-100 text-green-800'
      } else if (daysRemaining <= 0) {
        return 'bg-red-100 text-red-800'
      } else if (daysRemaining <= 7) {
        return 'bg-yellow-100 text-yellow-800'
      } else {
        return 'bg-green-100 text-green-800'
      }
    } else if (status === 'closed') {
      return 'bg-red-100 text-red-800'
    } else if (status === 'archived') {
      return 'bg-gray-100 text-gray-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string, closeDate?: string) => {
    const daysRemaining = getDaysRemaining(closeDate)
    
    if (status === 'open') {
      if (daysRemaining === null) {
        return 'Open'
      } else if (daysRemaining <= 0) {
        return 'Closing Soon'
      } else if (daysRemaining === 1) {
        return 'Closes Tomorrow'
      } else if (daysRemaining <= 7) {
        return `${daysRemaining} Days Left`
      } else {
        return 'Open'
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const hasActiveFilters = () => {
    return !!(filters.query || filters.agency_name || filters.state || 
              (filters.tags && filters.tags.length > 0) || 
              filters.date_from || filters.date_to || 
              (filters.status && filters.status !== 'all'))
  }

  const getActiveFilterChips = () => {
    const chips: Array<{ key: string, label: string, value: string, onRemove: () => void }> = []

    if (filters.query) {
      chips.push({
        key: 'query',
        label: 'Search',
        value: `"${filters.query}"`,
        onRemove: () => handleFilterChange('query', '')
      })
    }

    if (filters.agency_name) {
      chips.push({
        key: 'agency',
        label: 'Agency',
        value: filters.agency_name,
        onRemove: () => handleFilterChange('agency_name', undefined)
      })
    }

    if (filters.state) {
      chips.push({
        key: 'state',
        label: 'State',
        value: filters.state,
        onRemove: () => handleFilterChange('state', undefined)
      })
    }

    if (filters.status && filters.status !== 'all') {
      chips.push({
        key: 'status',
        label: 'Status',
        value: filters.status.charAt(0).toUpperCase() + filters.status.slice(1),
        onRemove: () => handleFilterChange('status', 'all')
      })
    }

    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => {
        chips.push({
          key: `tag_${tag}`,
          label: 'Topic',
          value: tag,
          onRemove: () => toggleTag(tag)
        })
      })
    }

    if (filters.date_from || filters.date_to) {
      const dateRange = [filters.date_from, filters.date_to].filter(Boolean).join(' to ')
      chips.push({
        key: 'date_range',
        label: 'Date Range',
        value: dateRange,
        onRemove: () => {
          handleFilterChange('date_from', undefined)
          handleFilterChange('date_to', undefined)
        }
      })
    }

    return chips
  }

  return (
    <PublicLayout 
      title="Browse Comment Opportunities - OpenComments"
      description="Find open public comment periods on government proposals and policy changes"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Public Comment Opportunities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find and participate in open comment periods on government proposals, 
            regulations, and policy changes that affect your community.
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
                value={filters.query || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Search by keyword, topic, or agency..."
                aria-label="Search dockets"
              />
            </div>

            {/* Filter Toggle and Controls */}
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
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sort by"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Agency */}
                  <div>
                    <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Agency
                    </label>
                    <input
                      type="text"
                      id="agency_name"
                      value={filters.agency_name || ''}
                      onChange={(e) => handleFilterChange('agency_name', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Department of Transportation"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      id="state"
                      value={filters.state || ''}
                      onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
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

                  {/* Date From */}
                  <div>
                    <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                      Open Date From
                    </label>
                    <input
                      type="date"
                      id="date_from"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                      Close Date To
                    </label>
                    <input
                      type="date"
                      id="date_to"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Topic Tags */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic Tags
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

                {/* Clear Filters */}
                {hasActiveFilters() && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
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
            )}
          </form>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters() && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-700 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {getActiveFilterChips().map(chip => (
                <span key={chip.key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {chip.label}: {chip.value}
                  <button
                    onClick={chip.onRemove}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

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
            <p className="text-gray-600">Searching for comment opportunities...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && dockets.length === 0 && !error && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comment opportunities found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters()
                ? 'Try adjusting your search terms or filters.'
                : 'There are currently no open comment periods.'}
            </p>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Dockets Grid */}
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
                    <Link 
                      to={`/agencies/${docket.agency_slug}`}
                      className="text-sm text-gray-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                      {docket.agency_name}
                    </Link>
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

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {docket.comment_count} comments
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {docket.close_at ? `Closes ${formatDate(docket.close_at)}` : 'Open-ended'}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
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
  )
}

export default DocketBrowse