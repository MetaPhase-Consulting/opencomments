import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAgency } from '../../contexts/AgencyContext'
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Calendar, 
  Settings, 
  Upload,
  X,
  AlertCircle,
  Check
} from 'lucide-react'

interface DocketFormData {
  // Basic Info
  title: string
  summary: string
  tags: string[]
  
  // Schedule
  openDate: string
  openTime: string
  closeDate: string
  closeTime: string
  
  // Submission Rules
  maxFileSize: number
  allowedFileTypes: string[]
  requireCaptcha: boolean
  
  // Public Settings
  urlSlug: string
  referenceCode: string
  
  // Moderation
  autoPublish: boolean
  
  // Supporting Documents
  supportingDocs: File[]
}

const DocketWizard = () => {
  const navigate = useNavigate()
  const { currentAgency } = useAgency()
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<DocketFormData>({
    title: '',
    summary: '',
    tags: [],
    openDate: new Date().toISOString().split('T')[0],
    openTime: '09:00',
    closeDate: '',
    closeTime: '17:00',
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'docx', 'jpg', 'png'],
    requireCaptcha: true,
    urlSlug: '',
    referenceCode: '',
    autoPublish: false,
    supportingDocs: []
  })

  const steps = [
    { number: 1, title: 'Basic Info', icon: FileText },
    { number: 2, title: 'Schedule & Rules', icon: Calendar },
    { number: 3, title: 'Settings & Documents', icon: Settings }
  ]

  const availableTags = [
    'Budget', 'Transportation', 'Housing', 'Environment', 'Public Safety',
    'Parks & Recreation', 'Zoning', 'Economic Development', 'Health', 'Education'
  ]

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'docx', label: 'Word Documents' },
    { value: 'txt', label: 'Text Files' },
    { value: 'jpg', label: 'JPEG Images' },
    { value: 'png', label: 'PNG Images' },
    { value: 'gif', label: 'GIF Images' }
  ]

  const updateFormData = (field: keyof DocketFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate URL slug from title
    if (field === 'title' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, urlSlug: slug }))
    }
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required'
      } else if (formData.title.length > 120) {
        newErrors.title = 'Title must be 120 characters or less'
      }
      
      if (!formData.summary.trim()) {
        newErrors.summary = 'Summary is required'
      }
    }

    if (step === 2) {
      if (!formData.openDate) {
        newErrors.openDate = 'Open date is required'
      }
      
      if (formData.closeDate && formData.closeDate <= formData.openDate) {
        newErrors.closeDate = 'Close date must be after open date'
      }
      
      if (formData.maxFileSize < 1 || formData.maxFileSize > 100) {
        newErrors.maxFileSize = 'File size must be between 1 and 100 MB'
      }
      
      if (formData.allowedFileTypes.length === 0) {
        newErrors.allowedFileTypes = 'At least one file type must be allowed'
      }
    }

    if (step === 3) {
      if (!formData.urlSlug.trim()) {
        newErrors.urlSlug = 'URL slug is required'
      } else if (!/^[a-z0-9-]+$/.test(formData.urlSlug)) {
        newErrors.urlSlug = 'URL slug can only contain lowercase letters, numbers, and hyphens'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(3, prev + 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    try {
      // TODO: Submit to backend API
      console.log('Submitting docket:', formData)
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Navigate to the new docket detail page
      navigate('/agency/dockets/new-docket-id')
    } catch (error) {
      console.error('Error creating docket:', error)
      setErrors({ submit: 'Failed to create docket. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files).filter(file => {
      // Basic validation - TODO: Add more robust validation
      return file.size <= formData.maxFileSize * 1024 * 1024
    })
    
    setFormData(prev => ({
      ...prev,
      supportingDocs: [...prev.supportingDocs, ...newFiles]
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supportingDocs: prev.supportingDocs.filter((_, i) => i !== index)
    }))
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const toggleFileType = (fileType: string) => {
    setFormData(prev => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.includes(fileType)
        ? prev.allowedFileTypes.filter(t => t !== fileType)
        : [...prev.allowedFileTypes, fileType]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/agency/dockets')}
            className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dockets
          </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Docket</h1>
        <p className="text-gray-600 mt-1">Set up a new public comment window</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep
              const isCompleted = step.number < currentStep
              const IconComponent = step.icon

              return (
                <li key={step.number} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  {index !== steps.length - 1 && (
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className={`h-0.5 w-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    </div>
                  )}
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                        ${isActive 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : isCompleted 
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-500'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-4 min-w-0">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-blue-600' : 'text-gray-500'}`}>
                        Step {step.number}
                      </p>
                      <p className={`text-sm ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Downtown Parking Regulations Update"
                maxLength={120}
                aria-describedby="title-hint title-error"
              />
              <p id="title-hint" className="text-sm text-gray-600 mt-1">
                {formData.title.length}/120 characters
              </p>
              {errors.title && (
                <p id="title-error" className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                Summary / Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => updateFormData('summary', e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.summary ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe the purpose of this comment period and what feedback you're seeking..."
                aria-describedby="summary-hint summary-error"
              />
              <p id="summary-hint" className="text-sm text-gray-600 mt-1">
                Supports Markdown formatting. This will be shown to the public.
              </p>
              {errors.summary && (
                <p id="summary-error" className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.summary}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formData.tags.includes(tag)
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Select relevant topics to help the public find this docket
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Rules */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Submission Rules</h2>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Open Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="openDate"
                  value={formData.openDate}
                  onChange={(e) => updateFormData('openDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.openDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.openDate && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.openDate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="openTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Open Time
                </label>
                <input
                  type="time"
                  id="openTime"
                  value={formData.openTime}
                  onChange={(e) => updateFormData('openTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="closeDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Close Date
                </label>
                <input
                  type="date"
                  id="closeDate"
                  value={formData.closeDate}
                  onChange={(e) => updateFormData('closeDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.closeDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Leave blank for open-ended comment period
                </p>
                {errors.closeDate && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.closeDate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Close Time
                </label>
                <input
                  type="time"
                  id="closeTime"
                  value={formData.closeTime}
                  onChange={(e) => updateFormData('closeTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* File Upload Rules */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">File Upload Rules</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum File Size (MB)
                  </label>
                  <input
                    type="number"
                    id="maxFileSize"
                    min="1"
                    max="100"
                    value={formData.maxFileSize}
                    onChange={(e) => updateFormData('maxFileSize', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.maxFileSize ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxFileSize && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.maxFileSize}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowed File Types
                  </label>
                  <div className="space-y-2">
                    {fileTypeOptions.map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.allowedFileTypes.includes(option.value)}
                          onChange={() => toggleFileType(option.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.allowedFileTypes && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.allowedFileTypes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Captcha */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requireCaptcha}
                  onChange={(e) => updateFormData('requireCaptcha', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Require CAPTCHA verification for submissions
                </span>
              </label>
              <p className="text-sm text-gray-600 mt-1 ml-6">
                Recommended to prevent spam and automated submissions
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Settings & Documents */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Public Settings & Documents</h2>
            </div>

            {/* Public Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="urlSlug" className="block text-sm font-medium text-gray-700 mb-1">
                  Public URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    /dockets/
                  </span>
                  <input
                    type="text"
                    id="urlSlug"
                    value={formData.urlSlug}
                    onChange={(e) => updateFormData('urlSlug', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.urlSlug ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="downtown-parking-update"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Auto-generated from title, but you can customize it
                </p>
                {errors.urlSlug && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.urlSlug}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="referenceCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Reference Code
                </label>
                <input
                  type="text"
                  id="referenceCode"
                  value={formData.referenceCode}
                  onChange={(e) => updateFormData('referenceCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ORD-2024-001"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Optional internal tracking number
                </p>
              </div>
            </div>

            {/* Moderation Preference */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Comment Moderation</h3>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="moderation"
                    checked={!formData.autoPublish}
                    onChange={() => updateFormData('autoPublish', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">
                      Require review before publishing (Recommended)
                    </span>
                    <p className="text-sm text-gray-600">
                      Comments will be held for staff review before appearing publicly
                    </p>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="moderation"
                    checked={formData.autoPublish}
                    onChange={() => updateFormData('autoPublish', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">
                      Auto-publish immediately
                    </span>
                    <p className="text-sm text-gray-600">
                      Comments will appear publicly as soon as they're submitted
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Supporting Documents */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Supporting Documents</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload documents for the public to review
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Choose Files
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, Word, images up to {formData.maxFileSize}MB each
                  </p>
                </div>
              </div>

              {/* Uploaded Files */}
              {formData.supportingDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                  {formData.supportingDocs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm text-red-600">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/agency/dockets')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isSubmitting ? 'Creating...' : 'Create Docket'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocketWizard