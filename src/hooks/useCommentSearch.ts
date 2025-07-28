import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface CommentSearchFilters {
  query?: string
  agency_name?: string
  state?: string
  tags?: string[]
  date_from?: string
  date_to?: string
  commenter_type?: 'individual' | 'organization' | 'agent' | 'anonymous'
  has_attachment?: boolean
  position?: 'support' | 'oppose' | 'neutral' | 'unclear'
  sort_by?: 'newest' | 'oldest' | 'agency' | 'docket'
  limit?: number
  offset?: number
}

export interface CommentSearchResult {
  id: string
  content: string
  snippet: string
  commenter_name?: string
  commenter_organization?: string
  commenter_type: string
  position: string
  created_at: string
  docket_id: string
  docket_title: string
  docket_slug?: string
  agency_name: string
  agency_jurisdiction?: string
  tags: string[]
  attachment_count: number
  rank: number
}

export interface CommentDetail {
  id: string
  content: string
  commenter_name?: string
  commenter_email?: string
  commenter_organization?: string
  commenter_type: string
  organization_name?: string
  authorization_statement?: string
  position: string
  created_at: string
  docket_id: string
  docket_title: string
  docket_slug?: string
  docket_description: string
  agency_name: string
  agency_jurisdiction?: string
  tags: string[]
  attachments: Array<{
    id: string
    filename: string
    file_url: string
    file_size: number
    mime_type: string
  }>
}

export const useCommentSearch = () => {
  const [results, setResults] = useState<CommentSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const searchComments = useCallback(async (filters: CommentSearchFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: searchError } = await supabase.rpc('search_comments', {
        p_query: filters.query || null,
        p_agency_name: filters.agency_name || null,
        p_state: filters.state || null,
        p_tags: filters.tags || null,
        p_date_from: filters.date_from ? new Date(filters.date_from).toISOString() : null,
        p_date_to: filters.date_to ? new Date(filters.date_to).toISOString() : null,
        p_commenter_type: filters.commenter_type || null,
        p_has_attachment: filters.has_attachment,
        p_position: filters.position || null,
        p_sort_by: filters.sort_by || 'newest',
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0
      })

      if (searchError) {
        console.error('Search error:', searchError)
        setError('Failed to search comments')
        return
      }

      const searchResults = data || []
      
      if (filters.offset === 0) {
        setResults(searchResults)
      } else {
        setResults(prev => [...prev, ...searchResults])
      }

      setHasMore(searchResults.length === (filters.limit || 20))
      setTotal(prev => filters.offset === 0 ? searchResults.length : prev + searchResults.length)

    } catch (err) {
      console.error('Search error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback((filters: CommentSearchFilters = {}) => {
    const newFilters = {
      ...filters,
      offset: results.length
    }
    searchComments(newFilters)
  }, [results.length, searchComments])

  const reset = useCallback(() => {
    setResults([])
    setError(null)
    setHasMore(true)
    setTotal(0)
  }, [])

  return {
    results,
    loading,
    error,
    hasMore,
    total,
    searchComments,
    loadMore,
    reset
  }
}

export const useCommentDetail = () => {
  const [comment, setComment] = useState<CommentDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComment = useCallback(async (commentId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase.rpc('get_comment_detail', {
        p_comment_id: commentId
      })

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        setError('Failed to load comment')
        return
      }

      if (!data || data.length === 0) {
        setError('Comment not found')
        return
      }

      setComment(data[0])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    comment,
    loading,
    error,
    fetchComment
  }
}