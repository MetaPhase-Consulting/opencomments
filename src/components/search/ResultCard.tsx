import React from 'react'
import { Link } from 'react-router-dom'
import { SearchResult } from '../../hooks/useAdvancedSearch'
import { 
  FileText, 
  MessageSquare, 
  Calendar, 
  User, 
  Building2, 
  Paperclip,
  ExternalLink 
} from 'lucide-react'

interface ResultCardProps {
  result: SearchResult
  searchQuery?: string
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, searchQuery }) => {
  const isDocket = result.result_type === 'docket'
  const isComment = result.result_type === 'comment'

  const getStatusBadge = (status: string, type: 'docket' | 'comment') => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    
    if (type === 'docket') {
      switch (status) {
        case 'open':
          return `${baseClasses} bg-green-100 text-green-800`
        case 'closed':
          return `${baseClasses} bg-red-100 text-red-800`
        case 'archived':
          return `${baseClasses} bg-gray-100 text-gray-800`
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`
      }
    } else {
      switch (status) {
        case 'published':
          return `${baseClasses} bg-green-100 text-green-800`
        case 'submitted':
        case 'under_review':
          return `${baseClasses} bg-yellow-100 text-yellow-800`
        case 'rejected':
          return `${baseClasses} bg-red-100 text-red-800`
        case 'flagged':
          return `${baseClasses} bg-orange-100 text-orange-800`
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`
      }
    }
  }

  const highlightText = (text: string, query?: string) => {
    if (!query || !text) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
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

  const truncateText = (text: string, maxLength: number = 200) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isDocket ? (
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
          ) : (
            <MessageSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {result.result_type}
          </span>
          <span className={getStatusBadge(result.status, result.result_type)}>
            {result.status}
          </span>
        </div>
        
        {result.rank > 0 && (
          <div className="text-xs text-gray-500">
            Relevance: {(result.rank * 100).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link
            to={isDocket ? `/agency/dockets/${result.result_id}` : `/agency/moderation/comment/${result.result_id}`}
            className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            {highlightText(result.title, searchQuery)}
          </Link>
        </h3>
        
        <p className="text-gray-700 leading-relaxed">
          {highlightText(truncateText(result.content), searchQuery)}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-2">
        {isDocket && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Created: {formatDate(result.created_at)}
            </div>
            
            {result.metadata.comment_deadline && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Deadline: {formatDate(result.metadata.comment_deadline)}
              </div>
            )}
            
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              {result.metadata.comment_count || 0} comments
            </div>
            
            {result.metadata.reference_code && (
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Ref: {result.metadata.reference_code}
              </div>
            )}
          </div>
        )}

        {isComment && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(result.created_at)}
            </div>
            
            {result.metadata.commenter_name && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {result.metadata.commenter_name}
              </div>
            )}
            
            {result.metadata.commenter_organization && (
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {result.metadata.commenter_organization}
              </div>
            )}
            
            {result.metadata.attachment_count > 0 && (
              <div className="flex items-center">
                <Paperclip className="w-4 h-4 mr-1" />
                {result.metadata.attachment_count} files
              </div>
            )}
            
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              On: {result.metadata.docket_title}
            </div>
          </div>
        )}

        {/* Tags for dockets */}
        {isDocket && result.metadata.tags && result.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {result.metadata.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <Link
          to={isDocket ? `/agency/dockets/${result.result_id}` : `/agency/moderation/comment/${result.result_id}`}
          className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          View {isDocket ? 'docket' : 'comment'}
          <ExternalLink className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  )
}

export default ResultCard