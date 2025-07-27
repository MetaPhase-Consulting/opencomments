import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAgency } from '../contexts/AgencyContext'
import { usePermissions } from './usePermissions'

export interface SearchFilters {
  // Text filters
  query?: string
  exact_phrase?: string
  exclude_words?: string
  
  // Date filters
  date_from?: string
  date_to?: string
  comment_date_from?: string
  comment_date_to?: string
  
  // Docket filters
  docket_statuses?: string[]
  tags?: string[]
  reference_code?: string
  
  // Comment filters
  comment_statuses?: string[]
  commenter_name?: string
  commenter_email?: string
  commenter_domain?: string
  
  // Attachment filters
  has_attachments?: boolean
  mime_types?: string[]
  min_file_size?: number
  max_file_size?: number
  
  // Sort and pagination
  sort_by?: 'relevance' | 'newest' | 'oldest' | 'alphabetical'
  limit?: number
  offset?: number
}

export interface SearchResult {
  result_type: 'docket' | 'comment'
  result_id: string
  title: string
  content: string
  status: string
  created_at: string
  updated_at: string
  metadata: any
  rank: number
}

export interface SearchStats {
  total_results: number
  docket_count: number
  comment_count: number
  search_time_ms: number
}

export const useAdvancedSearch = () => {
  const { currentAgency } = useAgency()
  const { userRole } = usePermissions(currentAgency?.id)
  const [results, setResults] = useState<SearchResult[]>([])
  const [stats, setStats] = useState<SearchStats>({
    total_results: 0,
    docket_count: 0,
    comment_count: 0,
    search_time_ms: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (filters: SearchFilters) => {
    if (!currentAgency || !userRole) {
      setError('No agency selected')
      return
    }

    setLoading(true)
    setError(null)
    const startTime = Date.now()

    try {
      // Build search query
      let searchQuery = filters.query || ''
      if (filters.exact_phrase) {
        searchQuery += ` "${filters.exact_phrase}"`
      }
      if (filters.exclude_words) {
        const excludeTerms = filters.exclude_words.split(' ').map(word => `-${word}`).join(' ')
        searchQuery += ` ${excludeTerms}`
      }

      // Build filters object
      const searchFilters: any = {}
      
      if (filters.date_from) searchFilters.date_from = filters.date_from
      if (filters.date_to) searchFilters.date_to = filters.date_to
      if (filters.docket_statuses?.length) searchFilters.docket_statuses = filters.docket_statuses
      if (filters.comment_statuses?.length) searchFilters.comment_statuses = filters.comment_statuses
      if (filters.tags?.length) searchFilters.tags = filters.tags
      if (filters.reference_code) searchFilters.reference_code = filters.reference_code
      if (filters.commenter_name) searchFilters.commenter_name = filters.commenter_name
      if (filters.commenter_email) searchFilters.commenter_email = filters.commenter_email
      if (filters.commenter_domain) searchFilters.commenter_domain = filters.commenter_domain
      if (filters.has_attachments !== undefined) searchFilters.has_attachments = filters.has_attachments
      if (filters.mime_types?.length) searchFilters.mime_types = filters.mime_types
      if (filters.min_file_size) searchFilters.min_file_size = filters.min_file_size
      if (filters.max_file_size) searchFilters.max_file_size = filters.max_file_size
      if (filters.sort_by) searchFilters.sort_by = filters.sort_by

      // Execute search
      const { data, error: searchError } = await supabase.rpc('advanced_search', {
        p_agency_id: currentAgency.id,
        p_user_role: userRole,
        p_query: searchQuery.trim() || null,
        p_filters: searchFilters,
        p_limit: filters.limit || 25,
        p_offset: filters.offset || 0
      })

      if (searchError) {
        console.error('Search error:', searchError)
        setError('Search failed. Please try again.')
        return
      }

      const searchResults = data || []
      setResults(searchResults)

      // Calculate stats
      const docketCount = searchResults.filter((r: SearchResult) => r.result_type === 'docket').length
      const commentCount = searchResults.filter((r: SearchResult) => r.result_type === 'comment').length
      const searchTime = Date.now() - startTime

      setStats({
        total_results: searchResults.length,
        docket_count: docketCount,
        comment_count: commentCount,
        search_time_ms: searchTime
      })

    } catch (err) {
      console.error('Search error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentAgency, userRole])

  const clearResults = useCallback(() => {
    setResults([])
    setStats({
      total_results: 0,
      docket_count: 0,
      comment_count: 0,
      search_time_ms: 0
    })
    setError(null)
  }, [])

  return {
    results,
    stats,
    loading,
    error,
    search,
    clearResults
  }
}