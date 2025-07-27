import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAgency } from '../contexts/AgencyContext'

export type ExportType = 'csv' | 'zip' | 'combined'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired'

export interface ExportJob {
  id: string
  agency_id: string
  docket_id?: string
  export_type: ExportType
  filters_json: any
  file_url?: string
  file_path?: string
  size_bytes: number
  status: ExportStatus
  progress_percent: number
  error_message?: string
  expires_at?: string
  created_by: string
  created_at: string
  updated_at: string
  docket_title?: string
}

export interface ExportFilters {
  docket_ids?: string[]
  comment_statuses?: string[]
  date_from?: string
  date_to?: string
  include_attachments?: boolean
  commenter_email_domain?: string
}

export interface AnalyticsData {
  total_dockets: number
  active_dockets: number
  total_comments: number
  approved_comments: number
  pending_comments: number
  total_attachments: number
  total_attachment_size_mb: number
  avg_comments_per_docket: number
  unique_commenters: number
  date_range: {
    from: string
    to: string
  }
}

export const useExports = () => {
  const { currentAgency } = useAgency()
  const [exports, setExports] = useState<ExportJob[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExports = async () => {
    if (!currentAgency) return

    try {
      const { data, error: fetchError } = await supabase
        .from('exports')
        .select(`
          *,
          dockets (
            title
          )
        `)
        .eq('agency_id', currentAgency.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error('Error fetching exports:', fetchError)
        setError('Failed to load exports')
        return
      }

      const formattedExports = data?.map(exp => ({
        ...exp,
        docket_title: exp.dockets?.title
      })) || []

      setExports(formattedExports)
    } catch (err) {
      console.error('Error in fetchExports:', err)
      setError('An unexpected error occurred')
    }
  }

  const fetchAnalytics = async (dateFrom?: string, dateTo?: string) => {
    if (!currentAgency) return

    try {
      const { data, error: analyticsError } = await supabase.rpc('get_agency_analytics', {
        p_agency_id: currentAgency.id,
        p_date_from: dateFrom || null,
        p_date_to: dateTo || null
      })

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError)
        setError('Failed to load analytics')
        return
      }

      setAnalytics(data)
    } catch (err) {
      console.error('Error in fetchAnalytics:', err)
      setError('Failed to load analytics')
    }
  }

  const createExport = async (
    exportType: ExportType,
    filters: ExportFilters,
    docketId?: string
  ): Promise<string> => {
    if (!currentAgency) throw new Error('No agency selected')

    try {
      const { data, error } = await supabase.rpc('create_export_job', {
        p_agency_id: currentAgency.id,
        p_docket_id: docketId || null,
        p_export_type: exportType,
        p_filters: filters
      })

      if (error) {
        console.error('Error creating export:', error)
        throw new Error(error.message)
      }

      // Refresh exports list
      await fetchExports()

      return data
    } catch (err) {
      console.error('Error in createExport:', err)
      throw err
    }
  }

  const deleteExport = async (exportId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('exports')
        .delete()
        .eq('id', exportId)

      if (error) {
        console.error('Error deleting export:', error)
        throw new Error('Failed to delete export')
      }

      // Refresh exports list
      await fetchExports()
    } catch (err) {
      console.error('Error in deleteExport:', err)
      throw err
    }
  }

  const getSignedDownloadUrl = async (filePath: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('agency-exports')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (error) {
        console.error('Error creating signed URL:', error)
        throw new Error('Failed to generate download link')
      }

      return data.signedUrl
    } catch (err) {
      console.error('Error in getSignedDownloadUrl:', err)
      throw err
    }
  }

  const pollExportStatus = async (exportId: string): Promise<ExportJob | null> => {
    try {
      const { data, error } = await supabase
        .from('exports')
        .select('*')
        .eq('id', exportId)
        .single()

      if (error) {
        console.error('Error polling export status:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Error in pollExportStatus:', err)
      return null
    }
  }

  // Initial load
  useEffect(() => {
    if (currentAgency) {
      setLoading(true)
      Promise.all([
        fetchExports(),
        fetchAnalytics()
      ]).finally(() => setLoading(false))
    }
  }, [currentAgency])

  return {
    exports,
    analytics,
    loading,
    error,
    createExport,
    deleteExport,
    getSignedDownloadUrl,
    pollExportStatus,
    fetchAnalytics,
    refresh: () => Promise.all([fetchExports(), fetchAnalytics()])
  }
}