import React, { useState, useEffect } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { useAgency } from '../../contexts/AgencyContext'
import { useModerationQueue, QueueComment, CommentStatus, ModerationAction } from '../../hooks/useModerationQueue'
import { PermissionGate } from '../../components/PermissionGate'
import { 
  Shield, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Flag,
  Paperclip,
  Download,
  Eye,
  AlertTriangle,
  Search,
  Filter,
  MoreHorizontal,
  User,
  Calendar,
  Building2
} from 'lucide-react'

type TabType = 'pending' | 'flagged' | 'approved' | 'rejected'

const ModerationQueue = () => {
  const { currentAgency } = useAgency()
  const { hasPermission } = usePermissions(currentAgency?.id)
  const { 
    comments, 
    stats, 
    loading, 
    error, 
    fetchComments, 
    moderateComment, 
    bulkModerate,
    getAttachmentSignedUrl 
  } = useModerationQueue()

  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionInProgress, setActionInProgress] = useState(false)
  const [selectedComment, setSelectedComment] = useState<QueueComment | null>(null)
  const [showCommentDetail, setShowCommentDetail] = useState(false)

  // Filter comments based on active tab and search
  const filteredComments = comments.filter(comment => {
    const matchesTab = comment.status === activeTab
    const matchesSearch = !searchQuery || 
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.docket_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.commenter_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesTab && matchesSearch
  })

  // Load comments when tab changes
  useEffect(() => {
    fetchComments(activeTab)
  }, [activeTab])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedComments(new Set())
  }

  const handleSelectComment = (commentId: string) => {
    const newSelected = new Set(selectedComments)
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId)
    } else {
      newSelected.add(commentId)
    }
    setSelectedComments(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedComments.size === filteredComments.length) {
      setSelectedComments(new Set())
    } else {
      setSelectedComments(new Set(filteredComments.map(c => c.id)))
    }
  }

  const handleSingleAction = async (commentId: string, action: ModerationAction) => {
    if (action === 'reject') {
      setSelectedComment(filteredComments.find(c => c.id === commentId) || null)
      setShowRejectModal(true)
      return
    }

    setActionInProgress(true)
    try {
      await moderateComment(commentId, action)
      // Show success message
      const actionText = action === 'approve' ? 'approved' : action === 'flag' ? 'flagged' : 'updated'
      console.log(`Comment ${actionText} successfully`)
    } catch (error) {
      console.error('Error moderating comment:', error)
      // Show error message
    } finally {
      setActionInProgress(false)
    }
  }

  const handleBulkAction = async (action: ModerationAction) => {
    if (selectedComments.size === 0) return

    if (action === 'reject') {
      setShowRejectModal(true)
      return
    }

    setActionInProgress(true)
    try {
      await bulkModerate(Array.from(selectedComments), action)
      setSelectedComments(new Set())
      // Show success message
      const actionText = action === 'approve' ? 'approved' : 'flagged'
      console.log(`${selectedComments.size} comments ${actionText} successfully`)
    } catch (error) {
      console.error('Error bulk moderating:', error)
      // Show error message
    } finally {
      setActionInProgress(false)
    }
  }

  const handleRejectConfirm = async () => {
    setActionInProgress(true)
    try {
      if (selectedComment) {
        await moderateComment(selectedComment.id, 'reject', rejectReason)
      } else if (selectedComments.size > 0) {
        await bulkModerate(Array.from(selectedComments), 'reject', rejectReason)
        setSelectedComments(new Set())
      }
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedComment(null)
    } catch (error) {
      console.error('Error rejecting comments:', error)
    } finally {
      setActionInProgress(false)
    }
  }

  const handleDownloadAttachment = async (filePath: string, filename: string) => {
    try {
      const signedUrl = await getAttachmentSignedUrl(filePath)
      const link = document.createElement('a')
      link.href = signedUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading file:', error)
      // Show error toast
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`
  }

  const truncateText = (text: string, maxLength: number = 80) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (!hasPermission('approve_comments')) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600">You don't have permission to access the moderation queue.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
        <p className="text-gray-600 mt-1">Review and moderate public comments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Flag className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Flagged</p>
              <p className="text-xl font-bold text-gray-900">{stats.flagged}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'pending', label: 'Pending', count: stats.pending, icon: Clock },
              { id: 'flagged', label: 'Flagged', count: stats.flagged, icon: Flag },
              { id: 'approved', label: 'Approved', count: stats.approved, icon: CheckCircle },
              { id: 'rejected', label: 'Rejected', count: stats.rejected, icon: XCircle }
            ].map(tab => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Search and Bulk Actions */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Search comments, dockets, or commenters..."
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedComments.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedComments.size} selected
                </span>
                {activeTab === 'pending' && (
                  <>
                    <button
                      onClick={() => handleBulkAction('approve')}
                      disabled={actionInProgress}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded hover:bg-green-100 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      disabled={actionInProgress}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                  </>
                )}
                {activeTab === 'approved' && (
                  <button
                    onClick={() => handleBulkAction('flag')}
                    disabled={actionInProgress}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-300 rounded hover:bg-orange-100 disabled:opacity-50"
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Flag
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Comments</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} comments
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'No comments match your search criteria.' : `No comments are currently ${activeTab}.`}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedComments.size === filteredComments.length && filteredComments.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Docket
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Files
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedComments.has(comment.id)}
                        onChange={() => handleSelectComment(comment.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {truncateText(comment.content)}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <User className="w-3 h-3 mr-1" />
                          {comment.commenter_name || 'Anonymous'}
                          {comment.commenter_organization && (
                            <>
                              <Building2 className="w-3 h-3 ml-2 mr-1" />
                              {comment.commenter_organization}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {comment.docket_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(comment.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {comment.attachment_count > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Paperclip className="w-4 h-4 mr-1" />
                          {comment.attachment_count}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedComment(comment)
                            setShowCommentDetail(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {activeTab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleSingleAction(comment.id, 'approve')}
                              disabled={actionInProgress}
                              className="text-green-600 hover:text-green-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSingleAction(comment.id, 'reject')}
                              disabled={actionInProgress}
                              className="text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {activeTab === 'approved' && (
                          <button
                            onClick={() => handleSingleAction(comment.id, 'flag')}
                            disabled={actionInProgress}
                            className="text-orange-600 hover:text-orange-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                            title="Flag"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Comment Detail Modal */}
      {showCommentDetail && selectedComment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Comment Details</h3>
                <button
                  onClick={() => setShowCommentDetail(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Commenter Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Commenter Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 text-gray-900">{selectedComment.commenter_name || 'Anonymous'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedComment.commenter_email || 'Not provided'}</span>
                    </div>
                    {selectedComment.commenter_organization && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Organization:</span>
                        <span className="ml-2 text-gray-900">{selectedComment.commenter_organization}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Docket Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Docket</h4>
                  <p className="text-sm text-gray-700">{selectedComment.docket_title}</p>
                </div>

                {/* Comment Content */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Comment</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedComment.content}</p>
                  </div>
                </div>

                {/* Attachments */}
                {selectedComment.attachments && selectedComment.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedComment.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.file_size)} • {attachment.mime_type}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadAttachment(attachment.id, attachment.filename)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Info */}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  <p>Submitted: {formatDate(selectedComment.created_at)}</p>
                  {selectedComment.updated_at !== selectedComment.created_at && (
                    <p>Last updated: {formatDate(selectedComment.updated_at)}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {activeTab === 'pending' && (
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleSingleAction(selectedComment.id, 'approve')
                      setShowCommentDetail(false)
                    }}
                    disabled={actionInProgress}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowCommentDetail(false)
                      handleSingleAction(selectedComment.id, 'reject')
                    }}
                    disabled={actionInProgress}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Comment{selectedComments.size > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedComment 
                  ? 'Please provide a reason for rejecting this comment:'
                  : `Please provide a reason for rejecting these ${selectedComments.size} comments:`
                }
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter rejection reason (optional)..."
              />
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectReason('')
                    setSelectedComment(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={actionInProgress}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionInProgress ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModerationQueue