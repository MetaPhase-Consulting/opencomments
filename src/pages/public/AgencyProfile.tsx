import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAgencyProfile } from '../../hooks/usePublicBrowse'
import PublicLayout from '../../components/PublicLayout'
import { 
  Building2, 
  MapPin, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Clock,
  ChevronLeft,
  AlertCircle,
  Filter,
  FileText
} from 'lucide-react'

const AgencyProfile = () => {
  const { slug } = useParams<{ slug: string }>()
  const { agency, loading, error, fetchAgency } = useAgencyProfile()
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'archived'>('all')

  useEffect(() => {
    if (slug) {
      fetchAgency(slug)
    }
  }, [slug, fetchAgency])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysRemaining = (closeDate?: string) => {
    if (!closeDate) return null
    const now = new Date()
    const close = new Date(closeDate)
    const diffTime = close.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (status: string, closeDate?: string) => {
    const daysRemaining = getDaysRemaining(closeDate)
    
    if (status === 'open') {
      if (daysRemaining === null) {
        return 'bg-green-100 text-green-800'
      } else if (daysRemaining <= 0) {
        return 'bg-red-100 text-red-800'
      } else if (daysRemaining <= 7) {
        return 'bg-yellow-100 text-yellow-800'
      } else {
        return 'bg-green-100 text-green-800'
      }
    } else if (status === 'closed') {
      return 'bg-red-100 text-red-800'
    } else if (status === 'archived') {
      return 'bg-gray-100 text-gray-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string, closeDate?: string) => {
    const daysRemaining = getDaysRemaining(closeDate)
    
    if (status === 'open') {
      if (daysRemaining === null) {
        return 'Open'
      } else if (daysRemaining <= 0) {
        return 'Closing Soon'
      } else if (daysRemaining === 1) {
        return 'Closes Tomorrow'
      } else if (daysRemaining <= 7) {
        return `${daysRemaining} Days Left`
      } else {
        return 'Open'
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const filteredDockets = agency?.dockets.filter(docket => {
    if (statusFilter === 'all') return true
    return docket.status === statusFilter
  }) || []

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </PublicLayout>
    )
  }

  if (error || !agency) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Agency Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              The agency you're looking for could not be found or may not have public dockets.
            </p>
            <Link
              to="/dockets"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Browse All Dockets
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout 
      title={`${agency.name} - OpenComments`}
      description={`Public comment opportunities from ${agency.name}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/dockets"
            className="inline-flex items-center text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to All Dockets
          </Link>
        </div>

        {/* Agency Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start space-x-6 mb-6 lg:mb-0">
              {/* Logo */}
              <div className="flex-shrink-0">
                {agency.logo_url ? (
                  <img 
                    src={agency.logo_url} 
                    alt={`${agency.name} logo`}
                    className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                )}
              </div>

              {/* Agency Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {agency.name}
                </h1>
                
                <div className="space-y-2 text-gray-600">
                  {agency.jurisdiction && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {agency.jurisdiction}
                    </div>
                  )}
                  
                  {agency.contact_email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <a 
                        href={`mailto:${agency.contact_email}`}
                        className="text-blue-700 hover:text-blue-800 underline"
                      >
                        {agency.contact_email}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member since {formatDate(agency.created_at)}
                  </div>
                </div>

                {agency.description && (
                  <div className="mt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {agency.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-blue-50 rounded-lg p-6 lg:w-64">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Agency Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Total Dockets</span>
                  <span className="font-semibold text-blue-900">{agency.dockets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Open Dockets</span>
                  <span className="font-semibold text-blue-900">
                    {agency.dockets.filter(d => d.status === 'open').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Total Comments</span>
                  <span className="font-semibold text-blue-900">
                    {agency.dockets.reduce((sum, d) => sum + d.comment_count, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dockets Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Public Dockets ({filteredDockets.length})
              </h2>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {filteredDockets.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter === 'all' ? 'No dockets yet' : `No ${statusFilter} dockets`}
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'This agency has not created any public dockets yet.'
                  : `This agency has no ${statusFilter} dockets.`
                }
              </p>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                >
                  Show All Dockets
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDockets.map((docket) => (
                <div key={docket.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        <Link 
                          to={`/dockets/${docket.slug}`}
                          className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        >
                          {docket.title}
                        </Link>
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Opened {formatDate(docket.open_at)}
                        </div>
                        {docket.close_at && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Closes {formatDate(docket.close_at)}
                          </div>
                        )}
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {docket.comment_count} comments
                        </div>
                      </div>

                      {docket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {docket.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(docket.status, docket.close_at)}`}>
                        {getStatusText(docket.status, docket.close_at)}
                      </span>
                      
                      <Link
                        to={`/dockets/${docket.slug}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        View Docket
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Interested in More Comment Opportunities?
          </h2>
          <p className="text-blue-800 mb-4">
            Explore dockets from other agencies and stay engaged with government decision-making.
          </p>
          <Link
            to="/dockets"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Browse All Dockets
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}

export default AgencyProfile