import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  export_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { export_id }: ExportRequest = await req.json()

    // Get export job details
    const { data: exportJob, error: exportError } = await supabase
      .from('exports')
      .select('*')
      .eq('id', export_id)
      .single()

    if (exportError || !exportJob) {
      throw new Error('Export job not found')
    }

    // Update status to processing
    await supabase.rpc('update_export_progress', {
      p_export_id: export_id,
      p_status: 'processing',
      p_progress_percent: 0
    })

    const { agency_id, docket_id, export_type, filters_json } = exportJob
    const filters = filters_json || {}

    let fileContent: Uint8Array
    let fileName: string
    let contentType: string

    if (export_type === 'csv') {
      // Generate CSV export
      const result = await generateCSVExport(supabase, agency_id, docket_id, filters)
      fileContent = new TextEncoder().encode(result.csv)
      fileName = `comments_export_${new Date().toISOString().split('T')[0]}.csv`
      contentType = 'text/csv'
    } else if (export_type === 'zip') {
      // Generate ZIP export
      const result = await generateZIPExport(supabase, agency_id, docket_id, filters)
      fileContent = result.zipBuffer
      fileName = `attachments_export_${new Date().toISOString().split('T')[0]}.zip`
      contentType = 'application/zip'
    } else if (export_type === 'combined') {
      // Generate combined export
      const result = await generateCombinedExport(supabase, agency_id, docket_id, filters)
      fileContent = result.zipBuffer
      fileName = `combined_export_${new Date().toISOString().split('T')[0]}.zip`
      contentType = 'application/zip'
    } else {
      throw new Error('Invalid export type')
    }

    // Upload to storage
    const filePath = `${agency_id}/${export_id}/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('agency-exports')
      .upload(filePath, fileContent, {
        contentType,
        cacheControl: '3600'
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get signed URL
    const { data: urlData } = supabase.storage
      .from('agency-exports')
      .getPublicUrl(filePath)

    // Update export job with completion
    await supabase.rpc('update_export_progress', {
      p_export_id: export_id,
      p_status: 'completed',
      p_progress_percent: 100,
      p_file_path: filePath,
      p_file_url: urlData.publicUrl,
      p_size_bytes: fileContent.length
    })

    return new Response(
      JSON.stringify({ success: true, file_url: urlData.publicUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Export generation failed:', error)

    // Update export job with error
    if (req.body) {
      try {
        const { export_id } = await req.json()
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        await supabase.rpc('update_export_progress', {
          p_export_id: export_id,
          p_status: 'failed',
          p_error_message: error.message
        })
      } catch (updateError) {
        console.error('Failed to update export status:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function generateCSVExport(supabase: any, agencyId: string, docketId: string | null, filters: any) {
  // Build query for comments
  let query = supabase
    .from('comments')
    .select(`
      id,
      content,
      status,
      commenter_name,
      commenter_email,
      commenter_organization,
      created_at,
      updated_at,
      dockets!inner (
        id,
        title,
        reference_code,
        agency_id
      ),
      comment_attachments (
        id,
        filename,
        file_size
      )
    `)
    .eq('dockets.agency_id', agencyId)

  if (docketId) {
    query = query.eq('docket_id', docketId)
  }

  if (filters.comment_statuses?.length) {
    query = query.in('status', filters.comment_statuses)
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  const { data: comments, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`)
  }

  // Generate CSV
  const headers = [
    'Comment ID',
    'Docket ID', 
    'Docket Title',
    'Reference Code',
    'Commenter Name',
    'Commenter Email',
    'Organization',
    'Comment Text',
    'Status',
    'Attachment Count',
    'Attachment Files',
    'Submitted At',
    'Updated At'
  ]

  const rows = comments.map((comment: any) => [
    comment.id,
    comment.dockets.id,
    comment.dockets.title,
    comment.dockets.reference_code || '',
    comment.commenter_name || '',
    comment.commenter_email || '',
    comment.commenter_organization || '',
    `"${comment.content.replace(/"/g, '""')}"`, // Escape quotes
    comment.status,
    comment.comment_attachments?.length || 0,
    comment.comment_attachments?.map((a: any) => a.filename).join('; ') || '',
    comment.created_at,
    comment.updated_at
  ])

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  return { csv, count: comments.length }
}

async function generateZIPExport(supabase: any, agencyId: string, docketId: string | null, filters: any) {
  // This is a simplified version - in production, you'd use a proper ZIP library
  // For now, return a placeholder
  const placeholder = 'ZIP export functionality requires additional ZIP library implementation'
  return { 
    zipBuffer: new TextEncoder().encode(placeholder),
    count: 0 
  }
}

async function generateCombinedExport(supabase: any, agencyId: string, docketId: string | null, filters: any) {
  // This would combine CSV + ZIP into a single archive
  // For now, return a placeholder
  const placeholder = 'Combined export functionality requires additional implementation'
  return { 
    zipBuffer: new TextEncoder().encode(placeholder),
    count: 0 
  }
}