import React, { useState, useEffect } from 'react'
import { useAdvancedSearch, SearchFilters } from '../../hooks/useAdvancedSearch'
import { usePermissions } from '../../hooks/usePermissions'
import { useAgency } from '../../contexts/AgencyContext'
import FilterGroup from '../../components/search/FilterGroup'
import FacetChip from '../../components/search/FacetChip'
import ResultCard from '../../components/search/ResultCard'
import { 
  Search, 
  Filter, 
  X, 
  Clock,
  FileText,
  MessageSquare,
  Sliders,
  Download,
  AlertCircle
} from 'lucide-react'

type SearchMode = 'smart' | 'advanced'

const GlobalSearch = () => {
  const { currentAgency } = useAgency()
  const { hasPermission, userRole } = usePermissions(currentAgency?.id)
  const { results, stats, loading, error, search, clearResults } = useAdvancedSearch()

  const [searchMode, setSearchMode] = useState<SearchMode>('smart')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    sort_by: 'relevance',
    limit: 25,
    offset: 0
  })

  // Advanced filter panel states
  const [openFilterGroups, setOpenFilterGroups] = useState<Record<string, boolean>>({
    text: true,
    dates: false,
    dockets: false,
    comments: false,
    attachments: false
  })

  // Available filter options
  const docketStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'archived', label: 'Archived' }
  ]

  const commentStatusOptions = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'published', label: 'Published' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'flagged', label: 'Flagged' }
  ]

  const mimeTypeOptions = [
    { value: 'application/pdf', label: 'PDF' },
    { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word (DOCX)' },
    { value: 'application/msword', label: 'Word (DOC)' },
    { value: 'text/plain', label: 'Text' },
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/gif', label: 'GIF' }
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ]

  // Mock tags - in real app, fetch from backend
  const availableTags = [
    'Budget', 'Transportation', 'Housing', 'Environment', 'Public Safety',
    'Parks & Recreation', 'Zoning', 'Economic Development', 'Health', 'Education'
  ]

  const toggleFilterGroup = (group: string) => {
    setOpenFilterGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }))
  }

  const addArrayFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: [...(prev[key] as string[] || []), value]
    }))
  }

  const removeArrayFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[] || []).filter(item => item !== value)
    }))
  }

  const clearFilterGroup = (group: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      
      switch (group) {
        case 'text':
          delete newFilters.exact_phrase
          delete newFilters.exclude_words
          break
        case 'dates':
          delete newFilters.date_from
          delete newFilters.date_to
          delete newFilters.comment_date_from
          delete newFilters.comment_date_to
          break
        case 'dockets':
          delete newFilters.docket_statuses
          delete newFilters.tags
          delete newFilters.reference_code
          break
        case 'comments':
          delete newFilters.comment_statuses
          delete newFilters.commenter_name
          delete newFilters.commenter_email
          delete newFilters.commenter_domain
          break
        case 'attachments':
          delete newFilters.has_attachments
          delete newFilters.mime_types
          delete newFilters.min_file_size
          delete newFilters.max_file_size
          break
      }
      
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setFilters({
      sort_by: 'relevance',
      limit: 25,
      offset: 0
    })
    setSearchQuery('')
    clearResults()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search({
      ...filters,
      query: searchQuery.trim() || undefined
    })
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filters).filter(key => 
      !['sort_by', 'limit', 'offset'].includes(key)
    )
    return filterKeys.some(key => {
      const value = filters[key as keyof SearchFilters]
      return value !== undefined && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true)
    }) || searchQuery.trim() !== ''
  }

  const getActiveFilterChips = () => {
    const chips: Array<{ key: string, label: string, value: string, onRemove: () => void }> = []

    // Text filters
    if (filters.exact_phrase) {
      chips.push({
        key: 'exact_phrase',
        label: 'Exact phrase',
        value: `"${filters.exact_phrase}"`,
        onRemove: () => updateFilter('exact_phrase', undefined)
      })
    }

    if (filters.exclude_words) {
      chips.push({
        key: 'exclude_words',
        label: 'Exclude',
        value: filters.exclude_words,
        onRemove: () => updateFilter('exclude_words', undefined)
      })
    }

    // Date filters
    if (filters.date_from || filters.date_to) {
      const dateRange = [filters.date_from, filters.date_to].filter(Boolean).join(' to ')
      chips.push({
        key: 'date_range',
        label: 'Date range',
        value: dateRange,
        onRemove: () => {
          updateFilter('date_from', undefined)
          updateFilter('date_to', undefined)
        }
      })
    }

    // Array filters
    ;(['docket_statuses', 'comment_statuses', 'tags', 'mime_types'] as const).forEach(key => {
      const values = filters[key] as string[] || []
      values.forEach(value => {
        const label = key.replace('_', ' ').replace('statuses', 'status')
        chips.push({
          key: `${key}_${value}`,
          label,
          value,
          onRemove: () => removeArrayFilter(key, value)
        })
      })
    })

    // Other filters
    if (filters.reference_code) {
      chips.push({
        key: 'reference_code',
        label: 'Reference',
        value: filters.reference_code,
        onRemove: () => updateFilter('reference_code', undefined)
      })
    }

    if (filters.commenter_name) {
      chips.push({
        key: 'commenter_name',
        label: 'Commenter',
        value: filters.commenter_name,
        onRemove: () => updateFilter('commenter_name', undefined)
      })
    }

    if (filters.has_attachments !== undefined) {
      chips.push({
        key: 'has_attachments',
        label: 'Has files',
        value: filters.has_attachments ? 'Yes' : 'No',
        onRemove: () => updateFilter('has_attachments', undefined)
      })
    }

    return chips
  }

  // Keyboard shortcut for advanced search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setSearchMode(searchMode === 'advanced' ? 'smart' : 'advanced')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchMode])

  if (!hasPermission('view_dashboard')) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600">You don't have permission to access search.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search</h1>
        <p className="text-gray-600 mt-1">Find dockets, comments, and attachments across your agency</p>
      </div>

      {/* Search Mode Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setSearchMode('smart')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                searchMode === 'smart'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search className="w-4 h-4 mr-2" />
              Smart Search
            </button>
            <button
              onClick={() => setSearchMode('advanced')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                searchMode === 'advanced'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sliders className="w-4 h-4 mr-2" />
              Advanced Search
              <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                Ctrl+Shift+F
              </kbd>
            </button>
          </nav>
        </div>

        {/* Search Interface */}
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Main Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder={searchMode === 'smart' ? 'Search dockets and comments...' : 'Enter keywords, phrases, or terms...'}
                aria-label="Search query"
              />
            </div>

            {/* Advanced Filters */}
            {searchMode === 'advanced' && (
              <div className="space-y-4" role="region" aria-label="Advanced search filters">
                {/* Text Filters */}
                <FilterGroup
                  title="Text Filters"
                  isOpen={openFilterGroups.text}
                  onToggle={() => toggleFilterGroup('text')}
                  hasActiveFilters={!!(filters.exact_phrase || filters.exclude_words)}
                  onClear={() => clearFilterGroup('text')}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exact_phrase" className="block text-sm font-medium text-gray-700 mb-1">
                        Exact Phrase
                      </label>
                      <input
                        type="text"
                        id="exact_phrase"
                        value={filters.exact_phrase || ''}
                        onChange={(e) => updateFilter('exact_phrase', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Must contain this exact phrase"
                      />
                    </div>
                    <div>
                      <label htmlFor="exclude_words" className="block text-sm font-medium text-gray-700 mb-1">
                        Exclude Words
                      </label>
                      <input
                        type="text"
                        id="exclude_words"
                        value={filters.exclude_words || ''}
                        onChange={(e) => updateFilter('exclude_words', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Exclude these words"
                      />
                    </div>
                  </div>
                </FilterGroup>

                {/* Date Filters */}
                <FilterGroup
                  title="Date Ranges"
                  isOpen={openFilterGroups.dates}
                  onToggle={() => toggleFilterGroup('dates')}
                  hasActiveFilters={!!(filters.date_from || filters.date_to || filters.comment_date_from || filters.comment_date_to)}
                  onClear={() => clearFilterGroup('dates')}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Docket Creation Date</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                            From
                          </label>
                          <input
                            type="date"
                            id="date_from"
                            value={filters.date_from || ''}
                            onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                            To
                          </label>
                          <input
                            type="date"
                            id="date_to"
                            value={filters.date_to || ''}
                            onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Comment Submission Date</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="comment_date_from" className="block text-sm font-medium text-gray-700 mb-1">
                            From
                          </label>
                          <input
                            type="date"
                            id="comment_date_from"
                            value={filters.comment_date_from || ''}
                            onChange={(e) => updateFilter('comment_date_from', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="comment_date_to" className="block text-sm font-medium text-gray-700 mb-1">
                            To
                          </label>
                          <input
                            type="date"
                            id="comment_date_to"
                            value={filters.comment_date_to || ''}
                            onChange={(e) => updateFilter('comment_date_to', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </FilterGroup>

                {/* Docket Filters */}
                <FilterGroup
                  title="Docket Filters"
                  isOpen={openFilterGroups.dockets}
                  onToggle={() => toggleFilterGroup('dockets')}
                  hasActiveFilters={!!(filters.docket_statuses?.length || filters.tags?.length || filters.reference_code)}
                  onClear={() => clearFilterGroup('dockets')}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Docket Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {docketStatusOptions.map(option => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={(filters.docket_statuses || []).includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  addArrayFilter('docket_statuses', option.value)
                                } else {
                                  removeArrayFilter('docket_statuses', option.value)
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              if ((filters.tags || []).includes(tag)) {
                                removeArrayFilter('tags', tag)
                              } else {
                                addArrayFilter('tags', tag)
                              }
                            }}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
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

                    <div>
                      <label htmlFor="reference_code" className="block text-sm font-medium text-gray-700 mb-1">
                        Reference Code
                      </label>
                      <input
                        type="text"
                        id="reference_code"
                        value={filters.reference_code || ''}
                        onChange={(e) => updateFilter('reference_code', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., ORD-2024-001"
                      />
                    </div>
                  </div>
                </FilterGroup>

                {/* Comment Filters */}
                {hasPermission('approve_comments') && (
                  <FilterGroup
                    title="Comment Filters"
                    isOpen={openFilterGroups.comments}
                    onToggle={() => toggleFilterGroup('comments')}
                    hasActiveFilters={!!(filters.comment_statuses?.length || filters.commenter_name || filters.commenter_email || filters.commenter_domain)}
                    onClear={() => clearFilterGroup('comments')}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comment Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {commentStatusOptions.map(option => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(filters.comment_statuses || []).includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    addArrayFilter('comment_statuses', option.value)
                                  } else {
                                    removeArrayFilter('comment_statuses', option.value)
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="commenter_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Commenter Name
                          </label>
                          <input
                            type="text"
                            id="commenter_name"
                            value={filters.commenter_name || ''}
                            onChange={(e) => updateFilter('commenter_name', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label htmlFor="commenter_email" className="block text-sm font-medium text-gray-700 mb-1">
                            Commenter Email
                          </label>
                          <input
                            type="email"
                            id="commenter_email"
                            value={filters.commenter_email || ''}
                            onChange={(e) => updateFilter('commenter_email', e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="commenter_domain" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Domain
                        </label>
                        <input
                          type="text"
                          id="commenter_domain"
                          value={filters.commenter_domain || ''}
                          onChange={(e) => updateFilter('commenter_domain', e.target.value || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="example.com"
                        />
                      </div>
                    </div>
                  </FilterGroup>
                )}

                {/* Attachment Filters */}
                {hasPermission('approve_comments') && (
                  <FilterGroup
                    title="Attachment Filters"
                    isOpen={openFilterGroups.attachments}
                    onToggle={() => toggleFilterGroup('attachments')}
                    hasActiveFilters={!!(filters.has_attachments !== undefined || filters.mime_types?.length || filters.min_file_size || filters.max_file_size)}
                    onClear={() => clearFilterGroup('attachments')}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Has Attachments
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="has_attachments"
                              checked={filters.has_attachments === undefined}
                              onChange={() => updateFilter('has_attachments', undefined)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Any</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="has_attachments"
                              checked={filters.has_attachments === true}
                              onChange={() => updateFilter('has_attachments', true)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="has_attachments"
                              checked={filters.has_attachments === false}
                              onChange={() => updateFilter('has_attachments', false)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File Types
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {mimeTypeOptions.map(option => (
                            <label key={option.value} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(filters.mime_types || []).includes(option.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    addArrayFilter('mime_types', option.value)
                                  } else {
                                    removeArrayFilter('mime_types', option.value)
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="min_file_size" className="block text-sm font-medium text-gray-700 mb-1">
                            Min File Size (KB)
                          </label>
                          <input
                            type="number"
                            id="min_file_size"
                            min="0"
                            value={filters.min_file_size || ''}
                            onChange={(e) => updateFilter('min_file_size', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="max_file_size" className="block text-sm font-medium text-gray-700 mb-1">
                            Max File Size (KB)
                          </label>
                          <input
                            type="number"
                            id="max_file_size"
                            min="0"
                            value={filters.max_file_size || ''}
                            onChange={(e) => updateFilter('max_file_size', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </FilterGroup>
                )}
              </div>
            )}

            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <label htmlFor="sort_by" className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by
                  </label>
                  <select
                    id="sort_by"
                    value={filters.sort_by}
                    onChange={(e) => updateFilter('sort_by', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                    Results per page
                  </label>
                  <select
                    id="limit"
                    value={filters.limit}
                    onChange={(e) => updateFilter('limit', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {hasActiveFilters() && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters() && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Active Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-700 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchQuery.trim() && (
              <FacetChip
                label="Query"
                value={searchQuery}
                onRemove={() => setSearchQuery('')}
              />
            )}
            {getActiveFilterChips().map(chip => (
              <FacetChip
                key={chip.key}
                label={chip.label}
                value={chip.value}
                onRemove={chip.onRemove}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {(results.length > 0 || error) && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    {stats.search_time_ms}ms
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>{stats.docket_count} dockets</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    <span>{stats.comment_count} comments</span>
                  </div>
                </div>
              </div>

              {results.length > 0 && (
                <button
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export Results
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <div className="space-y-4" role="region" aria-live="polite" aria-label="Search results">
              {results.map((result) => (
                <ResultCard
                  key={`${result.result_type}_${result.result_id}`}
                  result={result}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && results.length === 0 && hasActiveFilters() && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalSearch