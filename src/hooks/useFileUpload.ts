import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface UploadedFile {
  id: string
  filename: string
  file_url: string
  file_path: string
  mime_type: string
  file_size: number
}

interface UseFileUploadOptions {
  maxFileSize?: number // in MB
  maxFiles?: number
  allowedTypes?: string[]
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const {
    maxFileSize = 10, // 10MB default
    maxFiles = 3,
    allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'],
    onProgress,
    onError
  } = options

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedTypes.includes(extension)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }

    return null
  }

  const uploadFiles = async (
    files: FileList | File[],
    commentId: string,
    agencyId: string,
    docketId: string
  ): Promise<UploadedFile[]> => {
    const fileArray = Array.from(files)
    
    if (fileArray.length > maxFiles) {
      const errorMsg = `Maximum ${maxFiles} files allowed`
      setError(errorMsg)
      onError?.(errorMsg)
      throw new Error(errorMsg)
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const uploadedFiles: UploadedFile[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        // Validate file
        const validationError = validateFile(file)
        if (validationError) {
          setError(validationError)
          onError?.(validationError)
          throw new Error(validationError)
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop()
        const uniqueId = crypto.randomUUID()
        const filename = `${uniqueId}.${fileExtension}`
        const filePath = `agency/${agencyId}/docket/${docketId}/${commentId}/${filename}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('comment-attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          const errorMsg = 'Failed to upload file'
          setError(errorMsg)
          onError?.(errorMsg)
          throw new Error(errorMsg)
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('comment-attachments')
          .getPublicUrl(filePath)

        // Save attachment record to database
        const { data: attachmentData, error: dbError } = await supabase
          .from('comment_attachments')
          .insert({
            comment_id: commentId,
            filename: file.name,
            file_url: urlData.publicUrl,
            file_path: filePath,
            mime_type: file.type,
            file_size: file.size
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          // Clean up uploaded file
          await supabase.storage
            .from('comment-attachments')
            .remove([filePath])
          
          const errorMsg = 'Failed to save attachment record'
          setError(errorMsg)
          onError?.(errorMsg)
          throw new Error(errorMsg)
        }

        uploadedFiles.push(attachmentData)

        // Update progress
        const progressPercent = ((i + 1) / fileArray.length) * 100
        setProgress(progressPercent)
        onProgress?.(progressPercent)
      }

      return uploadedFiles
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  const getSignedUrl = async (filePath: string, expiresIn: number = 86400): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('comment-attachments')
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      throw new Error('Failed to generate download link')
    }

    return data.signedUrl
  }

  const deleteFile = async (attachmentId: string): Promise<void> => {
    // Get file path from database
    const { data: attachment, error: fetchError } = await supabase
      .from('comment_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single()

    if (fetchError || !attachment) {
      throw new Error('Attachment not found')
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('comment-attachments')
      .remove([attachment.file_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      throw new Error('Failed to delete file from storage')
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('comment_attachments')
      .delete()
      .eq('id', attachmentId)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      throw new Error('Failed to delete attachment record')
    }
  }

  return {
    uploading,
    progress,
    error,
    uploadFiles,
    getSignedUrl,
    deleteFile,
    validateFile
  }
}