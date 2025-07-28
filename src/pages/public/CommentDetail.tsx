import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCommentDetail } from '../../hooks/useCommentSearch'
import PublicLayout from '../../components/PublicLayout'
import Breadcrumb from '../../components/Breadcrumb'
import { 
  ChevronLeft, 
  Calendar, 
  Building2, 
  User, 
  FileText,
  Download,
  ExternalLink,
  AlertCircle,
  Paperclip
} from 'lucide-react'

const CommentDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { comment, loading, error, fetchComment } = useCommentDetail()

  useEffect(() => {
    if (id) {
      fetchComment(id)
    }
  }, [id, fetchComment])

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
    return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`
  }

  const getCommenterTypeLabel = (type: string) => {
    switch (type) {
      case 'individual': return 'Individual'
      case 'organization': return 'Organization'
      case 'behalf_of_another': return 'Agent/Representative'
      default: return 'Individual'
    }
  }

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'support': return 'Support'
      case 'oppose': return 'Oppose'
      case 'neutral': return 'Neutral'
      case 'unclear': return 'Unclear'
      default: return 'Not Specified'
    }
  }

  const getStateAbbreviation = (stateName: string) => {
    const stateAbbreviations: Record<string, string> = {
      'Alabama': 'al',
      'Alaska': 'ak',
      'Arizona': 'az',
      'Arkansas': 'ar',
      'California': 'ca',
      'Colorado': 'co',
      'Connecticut': 'ct',
      'Delaware': 'de',
      'Florida': 'fl',
      'Georgia': 'ga',
      'Hawaii': 'hi',
      'Idaho': 'id',
      'Illinois': 'il',
      'Indiana': 'in',
      'Iowa': 'ia',
      'Kansas': 'ks',
      'Kentucky': 'ky',
      'Louisiana': 'la',
      'Maine': 'me',
      'Maryland': 'md',
      'Massachusetts': 'ma',
      'Michigan': 'mi',
      'Minnesota': 'mn',
      'Mississippi': 'ms',
      'Missouri': 'mo',
      'Montana': 'mt',
      'Nebraska': 'ne',
      'Nevada': 'nv',
      'New Hampshire': 'nh',
      'New Jersey': 'nj',
      'New Mexico': 'nm',
      'New York': 'ny',
      'North Carolina': 'nc',
      'North Dakota': 'nd',
      'Ohio': 'oh',
      'Oklahoma': 'ok',
      'Oregon': 'or',
      'Pennsylvania': 'pa',
      'Rhode Island': 'ri',
      'South Carolina': 'sc',
      'South Dakota': 'sd',
      'Tennessee': 'tn',
      'Texas': 'tx',
      'Utah': 'ut',
      'Vermont': 'vt',
      'Virginia': 'va',
      'Washington': 'wa',
      'West Virginia': 'wv',
      'Wisconsin': 'wi',
      'Wyoming': 'wy',
      'District of Columbia': 'dc'
    }
    return stateAbbreviations[stateName] || stateName.toLowerCase().replace(/\s+/g, '-')
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </PublicLayout>
    )
  }

  if (error || !comment) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Comment Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              The comment you're looking for could not be found or may have been removed.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout 
      title={`Comment on ${comment.docket_title} - OpenComments`}
      description="View full public comment details"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: comment?.agency_jurisdiction || 'State', href: comment?.agency_jurisdiction ? `/state/${getStateAbbreviation(comment.agency_jurisdiction)}` : undefined },
            { label: comment?.docket_title || 'Docket', href: comment?.docket_slug ? `/dockets/${comment.docket_slug}` : undefined },
            { label: 'Comment', current: true }
          ]}
        />

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Approved Comment
              </span>
              <div className="text-sm text-gray-500">
                Submitted {formatDate(comment.created_at)}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Comment on: {comment.docket_slug ? (
                <Link 
                  to={`/dockets/${comment.docket_slug}`}
                  className="text-blue-700 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {comment.docket_title}
                </Link>
              ) : (
                comment.docket_title
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {comment.agency_name}
                {comment.agency_jurisdiction && ` (${comment.agency_jurisdiction})`}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(comment.created_at)}
              </div>
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="flex items-center">
                  <Paperclip className="w-4 h-4 mr-1" />
                  {comment.attachments.length} attachment{comment.attachments.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {comment.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {comment.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Comment</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            {comment.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Commenter Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Commenter Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Name</h3>
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-900">{comment.commenter_name || 'Anonymous'}</span>
              </div>
            </div>

            {comment.commenter_organization && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Organization</h3>
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{comment.commenter_organization}</span>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Commenter Type</h3>
              <span className="text-gray-900">{getCommenterTypeLabel(comment.commenter_type)}</span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Position</h3>
              <span className="text-gray-900">{getPositionLabel(comment.position)}</span>
            </div>

            {comment.organization_name && comment.commenter_type !== 'individual' && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {comment.commenter_type === 'organization' ? 'Organization Name' : 'Representing'}
                </h3>
                <span className="text-gray-900">{comment.organization_name}</span>
              </div>
            )}

            {comment.authorization_statement && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Authorization Statement</h3>
                <p className="text-gray-900 text-sm">{comment.authorization_statement}</p>
              </div>
            )}
          </div>
        </div>

        {/* Attachments */}
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Attachments ({comment.attachments.length})
            </h2>
            
            <div className="space-y-3">
              {comment.attachments.map(attachment => (
                <div key={attachment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-gray-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{attachment.filename}</h3>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(attachment.file_size)} • {attachment.mime_type}
                      </p>
                    </div>
                  </div>
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Docket Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Related Docket</h2>
          <p className="text-blue-800 mb-4">
            This comment was submitted on the docket "{comment.docket_title}" 
            managed by {comment.agency_name}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {comment.docket_slug && (
              <Link
                to={`/dockets/${comment.docket_slug}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Docket Details
              </Link>
            )}
            <Link
              to={`/comments/search?agency_name=${encodeURIComponent(comment.agency_name)}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Building2 className="w-4 h-4 mr-2" />
              More from {comment.agency_name}
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export default CommentDetail