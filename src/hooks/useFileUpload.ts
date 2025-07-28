import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { validateFileType, validateFileSize, validateMimeType, generateSecureFilename } from '../lib/validation'

export interface UploadedFile {
  id: string
  filename: string
  file_url: string
  file_path: string
  mime_type: string
  file_size: number
}

export interface UseFileUploadOptions {
  maxFileSize?: number
  maxFiles?: number
  allowedTypes?: string[]
  allowedMimeTypes?: string[]
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
    allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ],
    onProgress,
    onError
  } = options

  const validateFile = (file: File): string | null => {
    // Check file size
    if (!validateFileSize(file, maxFileSize)) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type by extension
    if (!validateFileType(file, allowedTypes)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }

    // Check MIME type
    if (!validateMimeType(file, allowedMimeTypes)) {
      return `File type not allowed. Please upload a valid document or image.`
    }

    // Additional security checks
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      return 'Invalid filename'
    }

    // Check for potentially dangerous file types
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'msi']
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension && dangerousExtensions.includes(extension)) {
      return 'This file type is not allowed for security reasons'
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

        // Generate secure filename
        const secureFilename = generateSecureFilename(file.name)
        const filePath = `agency/${agencyId}/docket/${docketId}/${commentId}/${secureFilename}`

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

        if (!urlData?.publicUrl) {
          const errorMsg = 'Failed to generate file URL'
          setError(errorMsg)
          onError?.(errorMsg)
          throw new Error(errorMsg)
        }

        uploadedFiles.push({
          id: uploadData.path,
          filename: file.name,
          file_url: urlData.publicUrl,
          file_path: filePath,
          mime_type: file.type,
          file_size: file.size
        })

        // Update progress
        const newProgress = ((i + 1) / fileArray.length) * 100
        setProgress(newProgress)
        onProgress?.(newProgress)
      }

      return uploadedFiles
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
      setError(errorMsg)
      onError?.(errorMsg)
      throw error
    } finally {
      setUploading(false)
      setProgress(0)
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