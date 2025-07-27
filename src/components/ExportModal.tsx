import React, { useState } from 'react'
import { useExports, ExportType, ExportFilters } from '../hooks/useExports'
import { usePermissions } from '../hooks/usePermissions'
import { useAgency } from '../contexts/AgencyContext'
import { 
  X, 
  Download, 
  FileText, 
  Archive, 
  Package,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  docketId?: string
  docketTitle?: string
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  docketId,
  docketTitle
}) => {
  const { currentAgency } = useAgency()
  const { hasPermission } = usePermissions(currentAgency?.id)
  const { createExport } = useExports()

  const [selectedTypes, setSelectedTypes] = useState<ExportType[]>(['csv'])
  const [includeAllStatuses, setIncludeAllStatuses] = useState(false)
  const [includeAttachments, setIncludeAttachments] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const exportTypeOptions = [
    {
      type: 'csv' as ExportType,
      icon: FileText,
      title: 'Comments CSV',
      description: 'Spreadsheet with all comment data and metadata'
    },
    {
      type: 'zip' as ExportType,
      icon: Archive,
      title: 'Attachments ZIP',
      description: 'Archive of all uploaded files with folder structure'
    },
    {
      type: 'combined' as ExportType,
      icon: Package,
      title: 'Combined Export',
      description: 'CSV + ZIP bundled together for complete export'
    }
  ]

  const handleTypeToggle = (type: ExportType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      setError('Please select at least one export type')
      return
    }

    setLoading(true)
    setError('')

    try {
      const filters: ExportFilters = {
        comment_statuses: includeAllStatuses 
          ? ['submitted', 'under_review', 'published', 'rejected', 'flagged']
          : ['published'],
        include_attachments: includeAttachments
      }

      if (docketId) {
        filters.docket_ids = [docketId]
      }

      // Create exports for each selected type
      const exportPromises = selectedTypes.map(type => 
        createExport(type, filters, docketId)
      )

      await Promise.all(exportPromises)
      
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create export')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  if (!hasPermission('bulk_export')) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">You don't have permission to create exports.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Export Data</h3>
              {docketTitle && (
                <p className="text-sm text-gray-600 mt-1">From: {docketTitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-600">
                  Export jobs created successfully! Check the Reports page to download when ready.
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Export Types */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Export Types</h4>
              <div className="space-y-3">
                {exportTypeOptions.map(option => {
                  const IconComponent = option.icon
                  const isSelected = selectedTypes.includes(option.type)
                  
                  return (
                    <label
                      key={option.type}
                      className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTypeToggle(option.type)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <IconComponent className="w-5 h-5 text-gray-600 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {option.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Export Options</h4>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={includeAllStatuses}
                    onChange={(e) => setIncludeAllStatuses(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900">
                      Include all comment statuses
                    </span>
                    <p className="text-sm text-gray-600">
                      By default, only approved/published comments are included
                    </p>
                  </div>
                </label>

                {(selectedTypes.includes('zip') || selectedTypes.includes('combined')) && (
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={includeAttachments}
                      onChange={(e) => setIncludeAttachments(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">
                        Include comment attachments
                      </span>
                      <p className="text-sm text-gray-600">
                        Download all uploaded files in organized folder structure
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Size Warning */}
            {(selectedTypes.includes('zip') || selectedTypes.includes('combined')) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-yellow-800">Large Export Warning</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      Attachment exports may be large and take several minutes to process. 
                      You'll receive a download link when ready.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading || selectedTypes.length === 0}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Export...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Create Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportModal