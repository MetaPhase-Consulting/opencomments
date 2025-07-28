import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface PublicDocket {
  id: string
  title: string
  summary: string
  slug: string
  status: 'open' | 'closed' | 'archived'
  open_at: string
  close_at?: string
  tags: string[]
  agency_id: string
  agency_name: string
  agency_slug: string
  agency_jurisdiction?: string
  comment_count: number
  created_at: string
  rank?: number
}

export interface DocketSearchFilters {
  query?: string
  agency_name?: string
  state?: string
  status?: 'open' | 'closed' | 'archived' | 'all'
  tags?: string[]
  date_from?: string
  date_to?: string
  sort_by?: 'newest' | 'closing' | 'title' | 'agency'
  limit?: number
  offset?: number
}

export interface AgencyProfile {
  id: string
  name: string
  jurisdiction?: string
  description?: string
  logo_url?: string
  contact_email?: string
  created_at: string
  dockets: Array<{
    id: string
    title: string
    slug: string
    status: string
    open_at: string
    close_at?: string
    tags: string[]
    comment_count: number
    created_at: string
  }>
}

export interface DocketDetail {
  id: string
  title: string
  description: string
  summary?: string
  slug: string
  status: string
  open_at: string
  close_at?: string
  tags: string[]
  agency_id: string
  agency_name: string
  agency_slug: string
  agency_jurisdiction?: string
  comment_count: number
  created_at: string
  attachments: Array<{
    id: string
    filename: string
    file_url: string
    file_size: number
    mime_type: string
  }>
  comments: Array<{
    id: string
    content: string
    commenter_name?: string
    commenter_organization?: string
    created_at: string
    attachment_count: number
  }>
}

export const usePublicBrowse = () => {
  const [dockets, setDockets] = useState<PublicDocket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const browseDockets = useCallback(async (filters: DocketSearchFilters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: searchError } = await supabase.rpc('browse_public_dockets', {
        p_query: filters.query || null,
        p_agency_name: filters.agency_name || null,
        p_state: filters.state || null,
        p_status: filters.status === 'all' ? null : (filters.status || null),
        p_tags: filters.tags || null,
        p_date_from: filters.date_from ? new Date(filters.date_from).toISOString() : null,
        p_date_to: filters.date_to ? new Date(filters.date_to).toISOString() : null,
        p_sort_by: filters.sort_by || 'newest',
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0
      })

      if (searchError) {
        console.error('Browse error:', searchError)
        setError('Failed to load dockets')
        return
      }

      const results = data || []
      
      if (filters.offset === 0) {
        setDockets(results)
      } else {
        setDockets(prev => [...prev, ...results])
      }

      setHasMore(results.length === (filters.limit || 20))
      setTotal(prev => filters.offset === 0 ? results.length : prev + results.length)

    } catch (err) {
      console.error('Browse error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback((filters: DocketSearchFilters = {}) => {
    const newFilters = {
      ...filters,
      offset: dockets.length
    }
    browseDockets(newFilters)
  }, [dockets.length, browseDockets])

  const reset = useCallback(() => {
    setDockets([])
    setError(null)
    setHasMore(true)
    setTotal(0)
  }, [])

  return {
    dockets,
    loading,
    error,
    hasMore,
    total,
    browseDockets,
    loadMore,
    reset
  }
}

export const useAgencyProfile = () => {
  const [agency, setAgency] = useState<AgencyProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAgency = useCallback(async (agencySlug: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase.rpc('get_agency_public_profile', {
        p_agency_slug: agencySlug
      })

      if (fetchError) {
        console.error('Agency fetch error:', fetchError)
        setError('Failed to load agency')
        return
      }

      if (!data || data.length === 0) {
        setError('Agency not found')
        return
      }

      setAgency(data[0])
    } catch (err) {
      console.error('Agency fetch error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    agency,
    loading,
    error,
    fetchAgency
  }
}

export const useDocketDetail = () => {
  const [docket, setDocket] = useState<DocketDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocket = useCallback(async (docketSlug: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase.rpc('get_docket_public_detail', {
        p_docket_slug: docketSlug
      })

      if (fetchError) {
        console.error('Docket fetch error:', fetchError)
        setError('Failed to load docket')
        return
      }

      if (!data || data.length === 0) {
        setError('Docket not found')
        return
      }

      setDocket(data[0])
    } catch (err) {
      console.error('Docket fetch error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    docket,
    loading,
    error,
    fetchDocket
  }
}