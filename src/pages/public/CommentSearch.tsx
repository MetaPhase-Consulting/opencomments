import React, { useState, useEffect, useCallback } from 'react'
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
  const query = (() => {
    const q = searchParams.get('q')
    return q && q.length <= 500 ? q : ''
  })()
  const { results, loading, error, hasMore, total, searchComments, loadMore, reset } = useCommentSearch()
  
  const [filters, setFilters] = useState<CommentSearchFilters>({
    query: query,
    sort_by: (() => {
      const sort = searchParams.get('sort')
      const validSorts = ['newest', 'oldest', 'agency', 'docket'] as const
      return validSorts.includes(sort as any) ? (sort as any) : 'newest'
    })(),
    limit: Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10') || 10)),
    offset: Math.max(0, parseInt(searchParams.get('offset') || '0') || 0),
    agency_name: (() => {
      const agency = searchParams.get('agency')
      return agency && agency.length <= 200 ? agency : undefined
    })(),
    state: (() => {
      const state = searchParams.get('state')
      return state && state.length <= 100 ? state : undefined
    })(),
    comment_filter: (() => {
      const filter = searchParams.get('comment_filter')
      return filter && filter.length <= 200 ? filter : undefined
    })(),
    filing_company: (() => {
      const company = searchParams.get('filing_company')
      return company && company.length <= 200 ? company : undefined
    })(),
    comment_id: (() => {
      const id = searchParams.get('comment_id')
      return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : undefined
    })(),
    docket_id: (() => {
      const id = searchParams.get('docket_id')
      return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : undefined
    })(),
    date_from: (() => {
      const date = searchParams.get('date_from')
      return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined
    })(),
    date_to: (() => {
      const date = searchParams.get('date_to')
      return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined
    })(),
    commenter_type: (() => {
      const type = searchParams.get('commenter_type')
      const validTypes = ['individual', 'organization', 'agent', 'anonymous'] as const
      return validTypes.includes(type as any) ? (type as any) : undefined
    })(),
    position: (() => {
      const pos = searchParams.get('position')
      const validPositions = ['support', 'oppose', 'neutral', 'unclear', 'not_specified'] as const
      return validPositions.includes(pos as any) ? (pos as any) : undefined
    })()
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

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

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'agency', label: 'Agency Name (A-Z)' },
    { value: 'docket', label: 'Docket Title (A-Z)' }
  ]

  useEffect(() => {
    // Handle URL parameter changes
    const urlQuery = (() => {
      const q = searchParams.get('q')
      return q && q.length <= 500 ? q : ''
    })()
    const urlSort = (() => {
      const sort = searchParams.get('sort')
      const validSorts = ['newest', 'oldest', 'agency', 'docket'] as const
      return validSorts.includes(sort as any) ? (sort as any) : 'newest'
    })()
    const urlLimit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10') || 10))
    const urlOffset = Math.max(0, parseInt(searchParams.get('offset') || '0') || 0)
    const urlAgency = (() => {
      const agency = searchParams.get('agency')
      return agency && agency.length <= 200 ? agency : undefined
    })()
    const urlState = (() => {
      const state = searchParams.get('state')
      return state && state.length <= 100 ? state : undefined
    })()
    const urlCommentFilter = (() => {
      const filter = searchParams.get('comment_filter')
      return filter && filter.length <= 200 ? filter : undefined
    })()
    const urlFilingCompany = (() => {
      const company = searchParams.get('filing_company')
      return company && company.length <= 200 ? company : undefined
    })()
    const urlCommentId = (() => {
      const id = searchParams.get('comment_id')
      return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : undefined
    })()
    const urlDocketId = (() => {
      const id = searchParams.get('docket_id')
      return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : undefined
    })()
    const urlDateFrom = (() => {
      const date = searchParams.get('date_from')
      return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined
    })()
    const urlDateTo = (() => {
      const date = searchParams.get('date_to')
      return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined
    })()
    const urlCommenterType = (() => {
      const type = searchParams.get('commenter_type')
      const validTypes = ['individual', 'organization', 'agent', 'anonymous'] as const
      return validTypes.includes(type as any) ? (type as any) : undefined
    })()
    const urlPosition = (() => {
      const pos = searchParams.get('position')
      const validPositions = ['support', 'oppose', 'neutral', 'unclear', 'not_specified'] as const
      return validPositions.includes(pos as any) ? (pos as any) : undefined
    })()

    const newFilters = {
      query: urlQuery,
      sort_by: urlSort,
      limit: urlLimit,
      offset: urlOffset,
      agency_name: urlAgency,
      state: urlState,
      comment_filter: urlCommentFilter,
      filing_company: urlFilingCompany,
      comment_id: urlCommentId,
      docket_id: urlDocketId,
      date_from: urlDateFrom,
      date_to: urlDateTo,
      commenter_type: urlCommenterType,
      position: urlPosition
    }
    
    setFilters(newFilters)
    reset()
    searchComments(newFilters)
  }, [searchParams, reset, searchComments])

  // Function to update URL with all parameters
  const updateURL = useCallback((newFilters: CommentSearchFilters) => {
    const newSearchParams = new URLSearchParams()
    
    if (newFilters.query) newSearchParams.set('q', newFilters.query)
    if (newFilters.sort_by) newSearchParams.set('sort', newFilters.sort_by)
    if (newFilters.limit) newSearchParams.set('limit', newFilters.limit.toString())
    if (newFilters.offset) newSearchParams.set('offset', newFilters.offset.toString())
    if (newFilters.agency_name) newSearchParams.set('agency', newFilters.agency_name)
    if (newFilters.state) newSearchParams.set('state', newFilters.state)
    if (newFilters.comment_filter) newSearchParams.set('comment_filter', newFilters.comment_filter)
    if (newFilters.filing_company) newSearchParams.set('filing_company', newFilters.filing_company)
    if (newFilters.comment_id) newSearchParams.set('comment_id', newFilters.comment_id)
    if (newFilters.docket_id) newSearchParams.set('docket_id', newFilters.docket_id)
    if (newFilters.date_from) newSearchParams.set('date_from', newFilters.date_from)
    if (newFilters.date_to) newSearchParams.set('date_to', newFilters.date_to)
    if (newFilters.commenter_type) newSearchParams.set('commenter_type', newFilters.commenter_type)
    if (newFilters.position) newSearchParams.set('position', newFilters.position)
    
    setSearchParams(newSearchParams)
  }, [setSearchParams])

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      const newFilters = { ...filters, query, offset: 0 }
      setFilters(newFilters)
      updateURL(newFilters)
      reset()
      searchComments(newFilters)
    }, 150) // 150ms delay

    setSearchTimeout(timeout)
  }, [filters, searchComments, reset, updateURL])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, offset: 0 }
    setFilters(newFilters)
    updateURL(newFilters)
    reset()
    searchComments(newFilters)
  }

  const handleFilterChange = (key: keyof CommentSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, offset: 0 }
    setFilters(newFilters)
    updateURL(newFilters)
    
    // For text fields, use debounced search
    const textFields = ['agency_name', 'comment_filter', 'filing_company', 'comment_id', 'docket_id']
    if (textFields.includes(key) && typeof value === 'string') {
      // Search immediately for text fields
      reset()
      searchComments(newFilters)
    } else {
      // For non-text fields (dropdowns, etc.), search immediately
      reset()
      searchComments(newFilters)
    }
  }


  const clearFilters = () => {
    const newFilters = { query: '', sort_by: 'newest' as const, limit: 10, offset: 0 }
    setFilters(newFilters)
    updateURL(newFilters)
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
    
    // Sanitize the query to prevent regex injection
    const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    try {
      const regex = new RegExp(`(${sanitizedQuery})`, 'gi')
      const parts = text.split(regex)
      
      return parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200">
            {part}
          </mark>
        ) : part
      )
    } catch (error) {
      // If regex creation fails, return original text
      console.warn('Invalid search query for highlighting:', query)
      return text
    }
  }

  const getStateAbbreviation = (stateName: string) => {
    const stateAbbreviations: Record<string, string> = {
      'Alabama': 'al',
      'Alaska': 'ak',
      'Arizona': 'az',
      'Arkansas': 'ar',
      'California': 'ca',
      'Colorado': 'co',
      'Connecticut': 'ct',
      'Delaware': 'de',
      'Florida': 'fl',
      'Georgia': 'ga',
      'Hawaii': 'hi',
      'Idaho': 'id',
      'Illinois': 'il',
      'Indiana': 'in',
      'Iowa': 'ia',
      'Kansas': 'ks',
      'Kentucky': 'ky',
      'Louisiana': 'la',
      'Maine': 'me',
      'Maryland': 'md',
      'Massachusetts': 'ma',
      'Michigan': 'mi',
      'Minnesota': 'mn',
      'Mississippi': 'ms',
      'Missouri': 'mo',
      'Montana': 'mt',
      'Nebraska': 'ne',
      'Nevada': 'nv',
      'New Hampshire': 'nh',
      'New Jersey': 'nj',
      'New Mexico': 'nm',
      'New York': 'ny',
      'North Carolina': 'nc',
      'North Dakota': 'nd',
      'Ohio': 'oh',
      'Oklahoma': 'ok',
      'Oregon': 'or',
      'Pennsylvania': 'pa',
      'Rhode Island': 'ri',
      'South Carolina': 'sc',
      'South Dakota': 'sd',
      'Tennessee': 'tn',
      'Texas': 'tx',
      'Utah': 'ut',
      'Vermont': 'vt',
      'Virginia': 'va',
      'Washington': 'wa',
      'West Virginia': 'wv',
      'Wisconsin': 'wi',
      'Wyoming': 'wy',
      'District of Columbia': 'dc',
      'Federal': 'us'
    }
    return stateAbbreviations[stateName] || 'us'
  }

  const hasActiveFilters = () => {
    return !!(filters.agency_name || filters.state || filters.comment_filter || 
              filters.filing_company || filters.comment_id || filters.docket_id ||
              filters.tags?.length || filters.date_from || filters.date_to || 
              filters.commenter_type || filters.position)
  }

  return (
    <PublicLayout 
      title="Search Public Comments - OpenComments"
      description="Search through public comments submitted on government proposals"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Public Comments
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
                onChange={(e) => {
                  const query = e.target.value
                  setFilters(prev => ({ ...prev, query }))
                  
                  // Trigger real-time search immediately
                  debouncedSearch(query)
                }}
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
                Advanced Search
                <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search Comments
              </button>
            </div>
            {/* end of filter toggle */}

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Agency and State - Row 1 */}
                  <div>
                    <label htmlFor="agency_name" className="block text-xs font-medium text-gray-700 mb-1">
                      Agency
                    </label>
                    <input
                      type="text"
                      id="agency_name"
                      value={filters.agency_name || ''}
                      onChange={(e) => handleFilterChange('agency_name', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Dept of Transportation"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      id="state"
                      value={filters.state || ''}
                      onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All States</option>
                      {stateOptions.map(state => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Comment Filter and Filing Company - Row 2 */}
                  <div>
                    <label htmlFor="comment_filter" className="block text-xs font-medium text-gray-700 mb-1">
                      Comment Filter
                    </label>
                    <input
                      type="text"
                      id="comment_filter"
                      value={filters.comment_filter || ''}
                      onChange={(e) => handleFilterChange('comment_filter', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Commenter name"
                    />
                  </div>

                  <div>
                    <label htmlFor="filing_company" className="block text-xs font-medium text-gray-700 mb-1">
                      Filing Company
                    </label>
                    <input
                      type="text"
                      id="filing_company"
                      value={filters.filing_company || ''}
                      onChange={(e) => handleFilterChange('filing_company', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Company name"
                    />
                  </div>

                  {/* Comment ID and Docket ID - Row 3 */}
                  <div>
                    <label htmlFor="comment_id" className="block text-xs font-medium text-gray-700 mb-1">
                      Comment ID
                    </label>
                    <input
                      type="text"
                      id="comment_id"
                      value={filters.comment_id || ''}
                      onChange={(e) => handleFilterChange('comment_id', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Comment ID"
                    />
                  </div>

                  <div>
                    <label htmlFor="docket_id" className="block text-xs font-medium text-gray-700 mb-1">
                      Docket ID
                    </label>
                    <input
                      type="text"
                      id="docket_id"
                      value={filters.docket_id || ''}
                      onChange={(e) => handleFilterChange('docket_id', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Docket ID"
                    />
                  </div>

                  {/* Date From and To - Row 4 */}
                  <div>
                    <label htmlFor="date_from" className="block text-xs font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      id="date_from"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="date_to" className="block text-xs font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      id="date_to"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Commenter Type and Position - Row 3 */}
                  <div>
                    <label htmlFor="commenter_type" className="block text-xs font-medium text-gray-700 mb-1">
                      Commenter Type
                    </label>
                    <select
                      id="commenter_type"
                      value={filters.commenter_type || ''}
                      onChange={(e) => handleFilterChange('commenter_type', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label htmlFor="position" className="block text-xs font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      id="position"
                      value={filters.position || ''}
                      onChange={(e) => handleFilterChange('position', e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Found {total} {total === 1 ? 'comment' : 'comments'}
              {filters.query && ` for "${filters.query}"`}
            </p>
            <div className="flex items-center space-x-2">
              <label htmlFor="sort_by" className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                id="sort_by"
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
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
              <div key={result.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500">Docket: </span>
                        {result.docket_slug ? (
                          <Link 
                            to={`/dockets/${result.docket_slug}`}
                            className="text-lg font-medium text-gray-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          >
                            {result.docket_title}
                          </Link>
                        ) : (
                          <span className="text-lg font-medium text-gray-900">
                            {result.docket_title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <div className="flex items-center">
                          {result.agency_jurisdiction && (
                            <Link 
                              to={`/state/${getStateAbbreviation(result.agency_jurisdiction)}`}
                              className="flex-shrink-0 mr-2"
                              aria-label={`${result.agency_jurisdiction} state page`}
                            >
                              <img 
                                src={`/states/flag-${getStateAbbreviation(result.agency_jurisdiction)}.svg`}
                                alt={`${result.agency_jurisdiction} flag`}
                                className="w-4 h-3 object-contain"
                              />
                            </Link>
                          )}
                          <Link 
                            to={`/agencies/${result.agency_name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          >
                            {result.agency_name}
                          </Link>
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
                    <span className="text-sm font-medium text-gray-500">Comment: </span>
                    {highlightText(result.snippet, filters.query)}
                  </div>

                  {/* Commenter Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-1" />
                      {result.commenter_name ? (
                        <button
                          onClick={() => {
                            const newFilters = { ...filters, comment_filter: result.commenter_name, offset: 0 }
                            setFilters(newFilters)
                            reset()
                            searchComments(newFilters)
                          }}
                          className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          {result.commenter_name}
                        </button>
                      ) : (
                        'Anonymous'
                      )}
                      {result.commenter_organization && (
                        <span className="ml-2">
                          • <button
                              onClick={() => {
                                const newFilters = { ...filters, filing_company: result.commenter_organization, offset: 0 }
                                setFilters(newFilters)
                                reset()
                                searchComments(newFilters)
                              }}
                              className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                              {result.commenter_organization}
                            </button>
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {results.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-200">
            {/* Results Summary */}
            <div className="text-sm text-gray-600">
              Showing comments {(filters.offset || 0) + 1}-{Math.min((filters.offset || 0) + results.length, total)} of {total}
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">
                Show:
              </label>
              <select
                id="pageSize"
                value={filters.limit || 10}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value)
                  const newFilters = { ...filters, limit: newLimit, offset: 0 }
                  setFilters(newFilters)
                  updateURL(newFilters)
                  reset()
                  searchComments(newFilters)
                }}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newOffset = Math.max(0, (filters.offset || 0) - (filters.limit || 10))
                  const newFilters = { ...filters, offset: newOffset }
                  setFilters(newFilters)
                  updateURL(newFilters)
                  reset()
                  searchComments(newFilters)
                }}
                disabled={loading || (filters.offset || 0) === 0}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1} of {Math.ceil(total / (filters.limit || 10))}
              </span>
              
              <button
                onClick={() => {
                  const newOffset = (filters.offset || 0) + (filters.limit || 10)
                  const newFilters = { ...filters, offset: newOffset }
                  setFilters(newFilters)
                  updateURL(newFilters)
                  reset()
                  searchComments(newFilters)
                }}
                disabled={loading || !hasMore}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}


      </div>
    </PublicLayout>
  )
}

export default CommentSearch