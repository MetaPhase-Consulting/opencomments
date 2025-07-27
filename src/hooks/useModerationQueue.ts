import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAgency } from '../contexts/AgencyContext'

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'flagged'
export type ModerationAction = 'approve' | 'reject' | 'flag' | 'unflag'

export interface QueueComment {
  id: string
  docket_id: string
  content: string
  status: CommentStatus
  commenter_name?: string
  commenter_email?: string
  commenter_organization?: string
  created_at: string
  updated_at: string
  docket_title: string
  agency_id: string
  attachment_count: number
  attachments?: Array<{
    id: string
    filename: string
    file_size: number
    mime_type: string
  }>
}

export interface ModerationStats {
  pending: number
  approved: number
  rejected: number
  flagged: number
  total: number
}

export const useModerationQueue = () => {
  const { currentAgency } = useAgency()
  const [comments, setComments] = useState<QueueComment[]>([])
  const [stats, setStats] = useState<ModerationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async (status?: CommentStatus) => {
    if (!currentAgency) return

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('moderation_queue')
        .select('*')
        .eq('agency_id', currentAgency.id)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching comments:', fetchError)
        setError('Failed to load comments')
        return
      }

      setComments(data || [])
    } catch (err) {
      console.error('Error in fetchComments:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!currentAgency) return

    try {
      const { data, error: statsError } = await supabase
        .from('moderation_queue')
        .select('status')
        .eq('agency_id', currentAgency.id)

      if (statsError) {
        console.error('Error fetching stats:', statsError)
        return
      }

      const statusCounts = data?.reduce((acc, comment) => {
        acc[comment.status] = (acc[comment.status] || 0) + 1
        acc.total = (acc.total || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      setStats({
        pending: statusCounts.pending || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        flagged: statusCounts.flagged || 0,
        total: statusCounts.total || 0
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const moderateComment = async (
    commentId: string,
    action: ModerationAction,
    reason?: string
  ): Promise<void> => {
    try {
      const newStatus: CommentStatus = action === 'approve' ? 'approved' :
                                     action === 'reject' ? 'rejected' :
                                     action === 'flag' ? 'flagged' : 'pending'

      // Update comment status
      const { error: updateError } = await supabase
        .from('comments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', commentId)

      if (updateError) {
        console.error('Error updating comment:', updateError)
        throw new Error('Failed to update comment status')
      }

      // Log the moderation action (handled by trigger)
      if (reason) {
        await supabase
          .from('moderation_logs')
          .insert({
            comment_id: commentId,
            action,
            actor_id: (await supabase.auth.getUser()).data.user?.id,
            reason,
            new_status: newStatus
          })
      }

      // Refresh data
      await Promise.all([fetchComments(), fetchStats()])
    } catch (err) {
      console.error('Error in moderateComment:', err)
      throw err
    }
  }

  const bulkModerate = async (
    commentIds: string[],
    action: ModerationAction,
    reason?: string
  ): Promise<void> => {
    try {
      const newStatus: CommentStatus = action === 'approve' ? 'approved' :
                                     action === 'reject' ? 'rejected' :
                                     action === 'flag' ? 'flagged' : 'pending'

      // Update all comments
      const { error: updateError } = await supabase
        .from('comments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .in('id', commentIds)

      if (updateError) {
        console.error('Error bulk updating comments:', updateError)
        throw new Error('Failed to update comments')
      }

      // Log bulk actions
      if (reason) {
        const userId = (await supabase.auth.getUser()).data.user?.id
        const logEntries = commentIds.map(commentId => ({
          comment_id: commentId,
          action,
          actor_id: userId,
          reason,
          new_status: newStatus
        }))

        await supabase
          .from('moderation_logs')
          .insert(logEntries)
      }

      // Refresh data
      await Promise.all([fetchComments(), fetchStats()])
    } catch (err) {
      console.error('Error in bulkModerate:', err)
      throw err
    }
  }

  const getAttachmentSignedUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('comment-attachments')
      .createSignedUrl(filePath, 86400) // 24 hours

    if (error) {
      console.error('Error creating signed URL:', error)
      throw new Error('Failed to generate download link')
    }

    return data.signedUrl
  }

  // Initial load
  useEffect(() => {
    if (currentAgency) {
      Promise.all([fetchComments(), fetchStats()])
    }
  }, [currentAgency])

  return {
    comments,
    stats,
    loading,
    error,
    fetchComments,
    fetchStats,
    moderateComment,
    bulkModerate,
    getAttachmentSignedUrl,
    refresh: () => Promise.all([fetchComments(), fetchStats()])
  }
}