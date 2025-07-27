import React, { useState } from 'react'
import { useAgency } from '../../contexts/AgencyContext'
import { usePermissions } from '../../hooks/usePermissions'
import { PermissionGate, PermissionButton } from '../../components/PermissionGate'
import { RoleBadge } from '../../components/RoleBadge'
import { 
  Search,
  FileText, 
  MessageSquare, 
  AlertCircle,
  Calendar,
  ExternalLink,
  Plus,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react'

const AgencyDashboard = () => {
  const { currentAgency } = useAgency()
  const { userRole, hasPermission } = usePermissions(currentAgency?.id)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - TODO: Replace with real data from backend
  const stats = {
    openThreads: 3,
    newComments: 47,
    pendingModeration: 8
  }

  const pendingComments = [
    {
      id: 1,
      threadTitle: 'Downtown Parking Regulations Update',
      commenterName: 'Sarah Johnson',
      postedDate: '2 hours ago',
      preview: 'I strongly oppose the proposed changes to parking meters...'
    },
    {
      id: 2,
      threadTitle: 'City Budget 2024 Public Review',
      commenterName: 'Michael Chen',
      postedDate: '4 hours ago',
      preview: 'The allocation for public transportation seems insufficient...'
    },
    {
      id: 3,
      threadTitle: 'New Housing Development Proposal',
      commenterName: 'Lisa Rodriguez',
      postedDate: '6 hours ago',
      preview: 'This development will significantly impact traffic patterns...'
    },
    {
      id: 4,
      threadTitle: 'Environmental Impact Assessment',
      commenterName: 'David Park',
      postedDate: '1 day ago',
      preview: 'The study fails to address the impact on local wildlife...'
    },
    {
      id: 5,
      threadTitle: 'Public Library Renovation Plans',
      commenterName: 'Jennifer Adams',
      postedDate: '1 day ago',
      preview: 'Please consider accessibility improvements in the design...'
    }
  ]

  const myThreads = [
    {
      id: 1,
      title: 'Downtown Parking Regulations Update',
      openDate: '2024-01-15',
      closeDate: '2024-02-15',
      commentCount: 23,
      status: 'open'
    },
    {
      id: 2,
      title: 'City Budget 2024 Public Review',
      openDate: '2024-01-10',
      closeDate: '2024-02-10',
      commentCount: 156,
      status: 'open'
    },
    {
      id: 3,
      title: 'New Housing Development Proposal',
      openDate: '2024-01-05',
      closeDate: '2024-02-05',
      commentCount: 89,
      status: 'open'
    }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/agency/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const hasNoThreads = myThreads.length === 0

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Search threads, comments, or commenters…"
              aria-label="Search threads, comments, or commenters"
            />
          </div>
        </form>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Open Threads - Visible to all roles */}
        <article className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="open-threads-title">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p id="open-threads-title" className="text-sm font-medium text-gray-600">
                Open Threads
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.openThreads}</p>
            </div>
          </div>
        </article>

        {/* New Comments - Visible to all except Viewer */}
        {hasPermission('approve_comments') && (
          <article className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="new-comments-title">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p id="new-comments-title" className="text-sm font-medium text-gray-600">
                  New Comments (30 days)
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.newComments}</p>
              </div>
            </div>
          </article>
        )}

        {/* Pending Moderation - Visible to Reviewer+ */}
        <PermissionGate permission="approve_comments">
          <article className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="pending-moderation-title">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p id="pending-moderation-title" className="text-sm font-medium text-gray-600">
                  Pending Moderation
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingModeration}</p>
              </div>
            </div>
          </article>
        </PermissionGate>

        {/* New Comments for Viewer role (shows in third position) */}
        {!hasPermission('approve_comments') && (
          <article className="bg-white rounded-lg shadow-sm p-6" aria-labelledby="new-comments-viewer-title">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p id="new-comments-viewer-title" className="text-sm font-medium text-gray-600">
                  New Comments (30 days)
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.newComments}</p>
              </div>
            </div>
          </article>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Queue Snapshot - Visible to Reviewer+ */}
        <PermissionGate permission="approve_comments">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Review Queue</h2>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mt-1">Most recent pending comments</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {pendingComments.map((comment) => (
                <div key={comment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {comment.threadTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        by {comment.commenterName} • {comment.postedDate}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {comment.preview}
                      </p>
                    </div>
                    <a
                      href={`/agency/moderation/comment/${comment.id}`}
                      className="ml-4 inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                      aria-label={`Review comment from ${comment.commenterName} on ${comment.threadTitle}`}
                    >
                      Review
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <a
                href="/agency/moderation/queue"
                className="text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                View all pending comments →
              </a>
            </div>
          </div>
        </PermissionGate>

        {/* My Threads At-a-Glance */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Threads</h2>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mt-1">Your active comment periods</p>
          </div>
          
          {hasNoThreads ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No comment periods yet
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't created any comment periods yet.
              </p>
              <PermissionButton
                permission="create_thread"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Thread
              </PermissionButton>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {myThreads.slice(0, 5).map((thread) => (
                  <div key={thread.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          {thread.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(thread.openDate)} - {formatDate(thread.closeDate)}
                          <span className="mx-2">•</span>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {thread.commentCount} comments
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {thread.status}
                        </span>
                        {hasPermission('edit_thread') ? (
                          <a
                            href={`/agency/threads/${thread.id}`}
                            className="text-blue-700 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <a
                  href="/agency/threads"
                  className="text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  View All Threads →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgencyDashboard