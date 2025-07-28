import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useCommentSearch, CommentSearchFilters } from '../../hooks/useCommentSearch'
import PublicLayout from '../../components/PublicLayout'
import { 
  Search, 
  Filter, 
  Calendar, 
  MessageSquare, 
  Building2,
  ChevronDown,
  X,
  AlertCircle,
  Paperclip,
  User,
  FileText
} from 'lucide-react'

const CommentSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { results, loading, error, hasMore, total, searchComments, loadMore, reset } = useCommentSearch()
  
  const [filters, setFilters] = useState<CommentSearchFilters>({
    query: query,
    sort_by: 'newest',
    limit: 20,
    offset: 0
  })
  
  const [showFilters, setShowFilters] = useState(false)

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

  const availableTags = [
    'Budget', 'Transportation', 'Housing', 'Environment', 'Public Safety',
    'Parks & Recreation', 'Zoning', 'Economic Development', 'Health', 'Education'
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
    { value: 'unclear', label: 'Unclear' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'agency', label: 'Agency Name (A-Z)' },
    { value: 'docket', label: 'Docket Title (A-Z)' }
  ]

  useEffect(() => {
    if (query) {
      const searchFilters = { ...filters, query, offset: 0 }
      setFilters(searchFilters)
      reset()
      searchComments(searchFilters)
    } else {
      // Show all results if no query
      const searchFilters = { ...filters, offset: 0 }
      reset()
      searchComments(searchFilters)
    }
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, offset: 0 }
    setFilters(newFilters)
    
    // Update URL with search query
    const newSearchParams = new URLSearchParams()
    if (newFilters.query) {
      newSearchParams.set('q', newFilters.query)
    }
    setSearchParams(newSearchParams)
    
    reset()
    searchComments(newFilters)
  }

  const handleFilterChange = (key: keyof CommentSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, offset: 0 }
    setFilters(newFilters)
    reset()
    searchComments(newFilters)
  }

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    handleFilterChange('tags', newTags)
  }

  const clearFilters = () => {
    const newFilters = { query: '', sort_by: 'newest' as const, limit: 20, offset: 0 }
    setFilters(newFilters)
    setSearchParams(new URLSearchParams())
    reset()
    searchComments(newFilters)
  }

  const getActiveFilterChips = () => {
    const chips: Array<{ key: string, label: string, value: string, onRemove: () => void }> = []

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

    if (filters.tags?.length) {
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

    if (filters.commenter_type) {
      const typeLabel = commenterTypeOptions.find(opt => opt.value === filters.commenter_type)?.label || filters.commenter_type
      chips.push({
        key: 'commenter_type',
        label: 'Commenter Type',
        value: typeLabel,
        onRemove: () => handleFilterChange('commenter_type', undefined)
      })
    }

    if (filters.has_attachment !== undefined) {
      chips.push({
        key: 'has_attachment',
        label: 'Has Attachment',
        value: filters.has_attachment ? 'Yes' : 'No',
        onRemove: () => handleFilterChange('has_attachment', undefined)
      })
    }

    if (filters.position) {
      const positionLabel = positionOptions.find(opt => opt.value === filters.position)?.label || filters.position
      chips.push({
        key: 'position',
        label: 'Position',
        value: positionLabel,
        onRemove: () => handleFilterChange('position', undefined)
      })
    }

    return chips
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const highlightText = (text: string, query?: string) => {
    if (!query || !text) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const hasActiveFilters = () => {
    return !!(filters.agency_name || filters.state || filters.tags?.length || 
              filters.date_from || filters.date_to || filters.commenter_type || 
              filters.has_attachment !== undefined || filters.position)
  }

  return (
    <PublicLayout 
      title={`Search Public Comments${query ? ` for "${query}"` : ''} - OpenComments`}
      description="Search through public comments submitted on government proposals"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Public Comments
            {query && (
              <span className="text-gray-600 font-normal"> for "{query}"</span>
            )}
          </h1>
          <p className="text-lg text-gray-600">
            Search through public comments submitted on government proposals and policy changes.
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
                placeholder="Search public comments..."
                aria-label="Search public comments"
              />
            </div>

            {/* Filter Toggle and Sort */}
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

                  {/* Commenter Type */}
                  <div>
                    <label htmlFor="commenter_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Commenter Type
                    </label>
                    <select
                      id="commenter_type"
                      value={filters.commenter_type || ''}
                      onChange={(e) => handleFilterChange('commenter_type', e.target.value || undefined)}
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

                  {/* Date From */}
                  <div>
                    <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                      Date From
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
                      Date To
                    </label>
                    <input
                      type="date"
                      id="date_to"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      id="position"
                      value={filters.position || ''}
                      onChange={(e) => handleFilterChange('position', e.target.value || undefined)}
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

                {/* Has Attachment */}
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.has_attachment === true}
                      onChange={(e) => handleFilterChange('has_attachment', e.target.checked ? true : undefined)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Only show comments with attachments
                    </span>
                  </label>
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
              {filters.query && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: "{filters.query}"
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, query: '' }))
                      setSearchParams(new URLSearchParams())
                    }}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
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
        {!loading && results.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {results.length} {results.length === 1 ? 'comment' : 'comments'}
              {filters.query && ` for "${filters.query}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && results.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching comments...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && !error && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Comments Found</h2>
            {filters.query || hasActiveFilters() ? (
              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-6">
                  We couldn't find any comments matching your search criteria.
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Try:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Using different keywords</li>
                    <li>• Checking your spelling</li>
                    <li>• Using broader search terms</li>
                    <li>• Removing some filters</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                  >
                    Clear search and filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-6">
                  No public comments are currently available.
                </p>
                <Link
                  to="/dockets"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                >
                  Browse Comment Opportunities
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-6 mb-8">
            {results.map((result) => (
              <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {result.docket_slug ? (
                          <Link 
                            to={`/dockets/${result.docket_slug}`}
                            className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          >
                            {result.docket_title}
                          </Link>
                        ) : (
                          result.docket_title
                        )}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {result.agency_name}
                          {result.agency_jurisdiction && ` (${result.agency_jurisdiction})`}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(result.created_at)}
                        </div>
                        {result.attachment_count > 0 && (
                          <div className="flex items-center">
                            <Paperclip className="w-4 h-4 mr-1" />
                            {result.attachment_count} file{result.attachment_count !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approved
                    </span>
                  </div>

                  {/* Comment Snippet */}
                  <div className="text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: result.snippet }} />
                  </div>

                  {/* Commenter Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-1" />
                      {result.commenter_name || 'Anonymous'}
                      {result.commenter_organization && (
                        <span className="ml-2">
                          • {result.commenter_organization}
                        </span>
                      )}
                    </div>
                    
                    <Link
                      to={`/comments/${result.id}`}
                      className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                      View Full Comment
                      <FileText className="w-4 h-4 ml-1" />
                    </Link>
                  </div>

                  {/* Tags */}
                  {result.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {result.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && results.length > 0 && (
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
                'Load More Comments'
              )}
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

export default CommentSearch