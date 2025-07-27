import React, { useState, useEffect } from 'react'
import { useExports, ExportJob, ExportFilters } from '../../hooks/useExports'
import { usePermissions } from '../../hooks/usePermissions'
import { useAgency } from '../../contexts/AgencyContext'
import { PermissionGate } from '../../components/PermissionGate'
import ExportModal from '../../components/ExportModal'
import { 
  BarChart3, 
  Download, 
  FileText, 
  MessageSquare, 
  Paperclip,
  Users,
  Calendar,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Archive,
  Package,
  RefreshCw,
  Filter
} from 'lucide-react'

const Reports = () => {
  const { currentAgency } = useAgency()
  const { hasPermission } = usePermissions(currentAgency?.id)
  const { 
    exports, 
    analytics, 
    loading, 
    error, 
    deleteExport, 
    getSignedDownloadUrl,
    pollExportStatus,
    fetchAnalytics,
    refresh 
  } = useExports()

  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
    to: new Date().toISOString().split('T')[0] // today
  })
  const [pollingExports, setPollingExports] = useState<Set<string>>(new Set())

  // Poll for export status updates
  useEffect(() => {
    if (pollingExports.size === 0) return

    const interval = setInterval(async () => {
      const updatedExports = new Set<string>()
      
      for (const exportId of pollingExports) {
        const exportJob = await pollExportStatus(exportId)
        if (exportJob && ['processing', 'pending'].includes(exportJob.status)) {
          updatedExports.add(exportId)
        }
      }
      
      setPollingExports(updatedExports)
      
      if (updatedExports.size !== pollingExports.size) {
        refresh() // Refresh the full list when status changes
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [pollingExports, pollExportStatus, refresh])

  // Start polling for processing exports
  useEffect(() => {
    const processingExports = exports
      .filter(exp => ['processing', 'pending'].includes(exp.status))
      .map(exp => exp.id)
    
    setPollingExports(new Set(processingExports))
  }, [exports])

  const handleDateRangeChange = async () => {
    await fetchAnalytics(
      selectedDateRange.from ? new Date(selectedDateRange.from).toISOString() : undefined,
      selectedDateRange.to ? new Date(selectedDateRange.to).toISOString() : undefined
    )
  }

  const handleDownload = async (exportJob: ExportJob) => {
    if (!exportJob.file_path) return

    try {
      const signedUrl = await getSignedDownloadUrl(exportJob.file_path)
      
      // Create download link
      const link = document.createElement('a')
      link.href = signedUrl
      link.download = `export_${exportJob.export_type}_${exportJob.created_at.split('T')[0]}.${
        exportJob.export_type === 'csv' ? 'csv' : 'zip'
      }`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      // Show error toast
    }
  }

  const handleDelete = async (exportId: string) => {
    if (!confirm('Are you sure you want to delete this export?')) return

    try {
      await deleteExport(exportId)
    } catch (error) {
      console.error('Delete failed:', error)
      // Show error toast
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processing':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getExportTypeIcon = (type: string) => {
    switch (type) {
      case 'csv':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'zip':
        return <Archive className="w-4 h-4 text-purple-600" />
      case 'combined':
        return <Package className="w-4 h-4 text-green-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    
    if (diffMs <= 0) return 'Expired'
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    } else {
      return `${diffMinutes}m`
    }
  }

  if (!hasPermission('view_dashboard')) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600">You don't have permission to access reports.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>
          <p className="text-gray-600 mt-1">Analytics dashboard and data export tools</p>
        </div>
        
        <PermissionGate permission="bulk_export">
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Export
          </button>
        </PermissionGate>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
              <button
                onClick={handleDateRangeChange}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  type="date"
                  id="date_from"
                  value={selectedDateRange.from}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="date"
                  id="date_to"
                  value={selectedDateRange.to}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="pt-6">
                <button
                  onClick={handleDateRangeChange}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Dockets</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics.total_dockets}</p>
                    <p className="text-xs text-blue-700">{analytics.active_dockets} currently open</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Comments</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.total_comments}</p>
                    <p className="text-xs text-green-700">{analytics.approved_comments} approved</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Paperclip className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-600">Attachments</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.total_attachments}</p>
                    <p className="text-xs text-purple-700">{analytics.total_attachment_size_mb} MB total</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-orange-600">Unique Commenters</p>
                    <p className="text-2xl font-bold text-orange-900">{analytics.unique_commenters}</p>
                    <p className="text-xs text-orange-700">{analytics.avg_comments_per_docket} avg per docket</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export History */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Export History</h2>
            <button
              onClick={refresh}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {exports.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exports yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first export to download comment data and attachments
              </p>
              <PermissionGate permission="bulk_export">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Export
                </button>
              </PermissionGate>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Export
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exports.map((exportJob) => (
                  <tr key={exportJob.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getExportTypeIcon(exportJob.export_type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {exportJob.export_type.toUpperCase()} Export
                          </div>
                          {exportJob.docket_title && (
                            <div className="text-sm text-gray-500">
                              {exportJob.docket_title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(exportJob.status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {exportJob.status}
                        </span>
                        {exportJob.status === 'processing' && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({exportJob.progress_percent}%)
                          </span>
                        )}
                      </div>
                      {exportJob.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          {exportJob.error_message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(exportJob.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exportJob.size_bytes > 0 ? formatFileSize(exportJob.size_bytes) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exportJob.expires_at ? getTimeUntilExpiry(exportJob.expires_at) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {exportJob.status === 'completed' && exportJob.file_path && (
                          <button
                            onClick={() => handleDownload(exportJob)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Download export"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        
                        <PermissionGate permission="bulk_export">
                          <button
                            onClick={() => handleDelete(exportJob.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete export"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  )
}

export default Reports