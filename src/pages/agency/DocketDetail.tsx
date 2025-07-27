import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { useAgency } from '../../contexts/AgencyContext'
import { PermissionButton } from '../../components/PermissionGate'
import { 
  ChevronLeft,
  Calendar,
  MessageSquare,
  Clock,
  Users,
  ExternalLink,
  Edit3,
  Archive,
  Play,
  Square,
  Share2,
  Download,
  AlertCircle,
  FileText,
  Eye
} from 'lucide-react'

interface DocketData {
  id: string
  title: string
  summary: string
  status: 'draft' | 'open' | 'closed' | 'archived'
  openDate: string
  closeDate?: string
  urlSlug: string
  referenceCode?: string
  autoPublish: boolean
  requireCaptcha: boolean
  maxFileSize: number
  allowedFileTypes: string[]
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
  commentCount: number
  pendingCount: number
  firstSubmission?: string
  lastSubmission?: string
  supportingDocs: Array<{
    id: string
    name: string
    url: string
    size: number
  }>
}

interface Comment {
  id: string
  author: string
  content: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  hasAttachments: boolean
}

interface ActivityLogEntry {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

const DocketDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentAgency } = useAgency()
  const { hasPermission } = usePermissions(currentAgency?.id)
  
  const [docket, setDocket] = useState<DocketData | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'activity' | 'settings'>('overview')
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<'open' | 'closed' | 'archived' | null>(null)

  // TODO: Replace with actual API calls
  useEffect(() => {
    const fetchDocketData = async () => {
      setLoading(true)
      try {
        // Mock data - replace with actual supabase queries
        const mockDocket: DocketData = {
          id: id || '1',
          title: 'Downtown Parking Regulations Update',
          summary: 'The City is proposing updates to downtown parking regulations to improve accessibility and reduce congestion. We are seeking public input on the proposed changes including new time limits, pricing structure, and accessibility improvements.',
          status: 'open',
          openDate: '2024-01-15T09:00:00Z',
          closeDate: '2024-02-15T17:00:00Z',
          urlSlug: 'downtown-parking-update',
          referenceCode: 'ORD-2024-001',
          autoPublish: false,
          requireCaptcha: true,
          maxFileSize: 10,
          allowedFileTypes: ['pdf', 'docx', 'jpg', 'png'],
          tags: ['Transportation', 'Downtown'],
          createdBy: 'current_user',
          createdAt: '2024-01-10T14:30:00Z',
          updatedAt: '2024-01-15T09:00:00Z',
          commentCount: 23,
          pendingCount: 5,
          firstSubmission: '2024-01-15T10:30:00Z',
          lastSubmission: '2024-01-21T16:45:00Z',
          supportingDocs: [
            {
              id: '1',
              name: 'Proposed Parking Regulations.pdf',
              url: '/documents/parking-regs.pdf',
              size: 2048000
            },
            {
              id: '2',
              name: 'Impact Assessment.docx',
              url: '/documents/impact-assessment.docx',
              size: 1024000
            }
          ]
        }

        const mockComments: Comment[] = [
          {
            id: '1',
            author: 'Sarah Johnson',
            content: 'I strongly oppose the proposed changes to parking meters. The increased rates will hurt local businesses and make downtown less accessible to working families.',
            submittedAt: '2024-01-21T16:45:00Z',
            status: 'pending',
            hasAttachments: false
          },
          {
            id: '2',
            author: 'Michael Chen',
            content: 'I support the accessibility improvements but have concerns about the impact on small businesses. Have you considered a graduated pricing structure?',
            submittedAt: '2024-01-21T14:20:00Z',
            status: 'approved',
            hasAttachments: true
          },
          {
            id: '3',
            author: 'Lisa Rodriguez',
            content: 'The proposed changes are necessary for reducing traffic congestion. I fully support the new time limits and pricing structure.',
            submittedAt: '2024-01-20T11:15:00Z',
            status: 'approved',
            hasAttachments: false
          }
        ]

        const mockActivityLog: ActivityLogEntry[] = [
          {
            id: '1',
            action: 'Docket opened for public comment',
            user: 'John Smith',
            timestamp: '2024-01-15T09:00:00Z'
          },
          {
            id: '2',
            action: 'Supporting document uploaded',
            user: 'John Smith',
            timestamp: '2024-01-14T16:30:00Z',
            details: 'Proposed Parking Regulations.pdf'
          },
          {
            id: '3',
            action: 'Docket created',
            user: 'John Smith',
            timestamp: '2024-01-10T14:30:00Z'
          }
        ]

        setDocket(mockDocket)
        setComments(mockComments)
        setActivityLog(mockActivityLog)
      } catch (error) {
        console.error('Error fetching docket:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDocketData()
    }
  }, [id])

  const handleStatusChange = async (newStatus: 'open' | 'closed' | 'archived') => {
    if (!docket) return

    try {
      // TODO: API call to update status
      console.log(`Changing status from ${docket.status} to ${newStatus}`)
      
      setDocket(prev => prev ? { ...prev, status: newStatus } : null)
      setShowStatusModal(false)
      setPendingStatusChange(null)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const confirmStatusChange = (newStatus: 'open' | 'closed' | 'archived') => {
    setPendingStatusChange(newStatus)
    setShowStatusModal(true)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium'
    switch (status) {
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'open':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'closed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'archived':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const getPublicUrl = () => {
    return `${window.location.origin}/dockets/${docket?.urlSlug}`
  }

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(getPublicUrl())
    // TODO: Show toast notification
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (!docket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Docket Not Found</h2>
        <p className="text-gray-600 mb-4">The requested docket could not be found.</p>
        <Link
          to="/agency/dockets"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dockets
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center mb-4">
          <Link
            to="/agency/dockets"
            className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dockets
          </Link>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{docket.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={getStatusBadge(docket.status)}>{docket.status}</span>
              {docket.referenceCode && (
                <span>Ref: {docket.referenceCode}</span>
              )}
              <span>Created {formatDate(docket.createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={copyPublicUrl}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </button>
            
            <PermissionButton
              permission="edit_thread"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </PermissionButton>
          </div>
        </div>
      </div>

      {/* Archive Banner */}
      {docket.status === 'archived' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Archive className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">
              This docket has been archived and is read-only.
            </span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Comments</p>
              <p className="text-xl font-bold text-gray-900">{docket.commentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-xl font-bold text-gray-900">{docket.pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Days Open</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.ceil((new Date().getTime() - new Date(docket.openDate).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Commenters</p>
              <p className="text-xl font-bold text-gray-900">{comments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'comments', label: 'Public Comments', icon: MessageSquare },
              { id: 'activity', label: 'Activity Log', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Edit3 }
            ].map(tab => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.id === 'comments' && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {docket.commentCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
                <div className="prose max-w-none text-gray-700">
                  {docket.summary.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Schedule</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Opens</dt>
                      <dd className="text-sm text-gray-900">{formatDate(docket.openDate)}</dd>
                    </div>
                    {docket.closeDate && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Closes</dt>
                        <dd className="text-sm text-gray-900">{formatDate(docket.closeDate)}</dd>
                      </div>
                    )}
                    {docket.firstSubmission && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">First Submission</dt>
                        <dd className="text-sm text-gray-900">{formatDate(docket.firstSubmission)}</dd>
                      </div>
                    )}
                    {docket.lastSubmission && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Last Submission</dt>
                        <dd className="text-sm text-gray-900">{formatDate(docket.lastSubmission)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Configuration</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Moderation</dt>
                      <dd className="text-sm text-gray-900">
                        {docket.autoPublish ? 'Auto-publish' : 'Require review'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">CAPTCHA</dt>
                      <dd className="text-sm text-gray-900">
                        {docket.requireCaptcha ? 'Required' : 'Not required'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Max File Size</dt>
                      <dd className="text-sm text-gray-900">{docket.maxFileSize} MB</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Allowed File Types</dt>
                      <dd className="text-sm text-gray-900">
                        {docket.allowedFileTypes.join(', ').toUpperCase()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {docket.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {docket.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {docket.supportingDocs.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Supporting Documents</h3>
                  <div className="space-y-2">
                    {docket.supportingDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-600">{formatFileSize(doc.size)}</p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Public Comments ({docket.commentCount})
                </h3>
                <div className="flex items-center space-x-2">
                  <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Comments</option>
                    <option>Pending Review</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                  <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{comment.author}</h4>
                        <p className="text-xs text-gray-600">{formatDate(comment.submittedAt)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          comment.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : comment.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {comment.status}
                        </span>
                        {comment.hasAttachments && (
                          <span className="text-xs text-gray-500">📎</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
                    {hasPermission('approve_comments') && comment.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded hover:bg-green-100">
                          Approve
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-300 rounded hover:bg-red-100">
                          Reject
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100">
                          Flag
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">Comments will appear here once the public starts submitting feedback.</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {activityLog.map((entry, index) => (
                    <li key={entry.id}>
                      <div className="relative pb-8">
                        {index !== activityLog.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <Clock className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {entry.action}
                                {entry.details && (
                                  <span className="text-gray-600"> - {entry.details}</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">by {entry.user}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(entry.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Docket Settings</h3>
                <PermissionButton
                  permission="edit_thread"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Docket
                </PermissionButton>
              </div>

              {/* Public URL */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Public URL</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={getPublicUrl()}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyPublicUrl}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Copy
                  </button>
                  <a
                    href={getPublicUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Status Controls */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Status Controls</h4>
                <div className="space-y-3">
                  {docket.status === 'draft' && (
                    <PermissionButton
                      permission="close_thread"
                      onClick={() => confirmStatusChange('open')}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Open for Public Comment
                    </PermissionButton>
                  )}
                  
                  {docket.status === 'open' && (
                    <PermissionButton
                      permission="close_thread"
                      onClick={() => confirmStatusChange('closed')}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Close Comment Period
                    </PermissionButton>
                  )}
                  
                  {(docket.status === 'closed' || docket.status === 'open') && (
                    <PermissionButton
                      permission="archive_thread"
                      onClick={() => confirmStatusChange('archived')}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Docket
                    </PermissionButton>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && pendingStatusChange && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Status Change
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to {pendingStatusChange} this comment window? 
              {pendingStatusChange === 'closed' && ' This will prevent new submissions.'}
              {pendingStatusChange === 'archived' && ' This action cannot be undone.'}
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setPendingStatusChange(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(pendingStatusChange)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  pendingStatusChange === 'archived' 
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {pendingStatusChange === 'open' && 'Open'}
                {pendingStatusChange === 'closed' && 'Close'}
                {pendingStatusChange === 'archived' && 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocketDetail