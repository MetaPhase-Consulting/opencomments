import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { useAgency } from '../../contexts/AgencyContext'
import { PermissionButton } from '../../components/PermissionGate'
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  MessageSquare, 
  Clock,
  Archive,
  Eye,
  Edit3
} from 'lucide-react'

interface Docket {
  id: string
  title: string
  status: 'open' | 'closed' | 'archived'
  open_date: string
  close_date?: string
  comment_count: number
  last_activity: string
  created_by: string
}

const DocketList = () => {
  const { currentAgency } = useAgency()
  const { hasPermission } = usePermissions(currentAgency?.id)
  const [dockets, setDockets] = useState<Docket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'archived'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Docket>('last_activity')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // TODO: Replace with actual API call
  useEffect(() => {
    const fetchDockets = async () => {
      setLoading(true)
      try {
        // Mock data - replace with actual supabase query
        const mockDockets: Docket[] = [
          {
            id: '1',
            title: 'Downtown Parking Regulations Update',
            status: 'open',
            open_date: '2024-01-15T09:00:00Z',
            close_date: '2024-02-15T17:00:00Z',
            comment_count: 23,
            last_activity: '2024-01-20T14:30:00Z',
            created_by: 'current_user'
          },
          {
            id: '2',
            title: 'City Budget 2024 Public Review',
            status: 'open',
            open_date: '2024-01-10T08:00:00Z',
            close_date: '2024-02-10T23:59:00Z',
            comment_count: 156,
            last_activity: '2024-01-21T11:15:00Z',
            created_by: 'other_user'
          },
          {
            id: '3',
            title: 'New Housing Development Proposal',
            status: 'closed',
            open_date: '2023-12-01T09:00:00Z',
            close_date: '2023-12-31T17:00:00Z',
            comment_count: 89,
            last_activity: '2023-12-31T16:45:00Z',
            created_by: 'current_user'
          }
        ]
        setDockets(mockDockets)
      } catch (error) {
        console.error('Error fetching dockets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDockets()
  }, [currentAgency])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  const handleSort = (field: keyof Docket) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
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

  const filteredDockets = dockets.filter(docket => {
    const matchesSearch = docket.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || docket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedDockets = [...filteredDockets].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    const direction = sortDirection === 'asc' ? 1 : -1
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * direction
    }
    return 0
  })

  const itemsPerPage = 20
  const totalPages = Math.ceil(sortedDockets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDockets = sortedDockets.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dockets</h1>
          <p className="text-gray-600 mt-1">Manage public comment windows</p>
        </div>
        <PermissionButton
          permission="create_thread"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Docket
        </PermissionButton>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search dockets by title or reference..."
                  aria-label="Search dockets"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </form>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm">
        {sortedDockets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No dockets found' : 'No dockets yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first comment window to start collecting public input.'
              }
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <PermissionButton
                permission="create_thread"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Docket
              </PermissionButton>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                      aria-sort={sortField === 'title' ? sortDirection : 'none'}
                    >
                      Title
                      {sortField === 'title' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('open_date')}
                      aria-sort={sortField === 'open_date' ? sortDirection : 'none'}
                    >
                      Open Date
                      {sortField === 'open_date' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Close Date
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('comment_count')}
                      aria-sort={sortField === 'comment_count' ? sortDirection : 'none'}
                    >
                      Comments
                      {sortField === 'comment_count' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('last_activity')}
                      aria-sort={sortField === 'last_activity' ? sortDirection : 'none'}
                    >
                      Last Activity
                      {sortField === 'last_activity' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedDockets.map((docket) => (
                    <tr key={docket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <Link 
                            to={`/agency/dockets/${docket.id}`}
                            className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                          >
                            {docket.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(docket.status)}>
                          {docket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(docket.open_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {docket.close_date ? (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(docket.close_date)}
                          </div>
                        ) : (
                          <span className="text-gray-400">Open-ended</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {docket.comment_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(docket.last_activity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/agency/dockets/${docket.id}`}
                            className="text-blue-700 hover:text-blue-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`View ${docket.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {hasPermission('edit_thread') && (
                            <Link
                              to={`/agency/dockets/${docket.id}/edit`}
                              className="text-gray-600 hover:text-gray-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label={`Edit ${docket.title}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {paginatedDockets.map((docket) => (
                <div key={docket.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 flex-1">
                      <Link 
                        to={`/agency/dockets/${docket.id}`}
                        className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      >
                        {docket.title}
                      </Link>
                    </h3>
                    <span className={getStatusBadge(docket.status)}>
                      {docket.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Opens: {formatDate(docket.open_date)}
                    </div>
                    {docket.close_date && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Closes: {formatDate(docket.close_date)}
                      </div>
                    )}
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {docket.comment_count} comments
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      Last activity: {formatDate(docket.last_activity)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/agency/dockets/${docket.id}`}
                        className="text-blue-700 hover:text-blue-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`View ${docket.title}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {hasPermission('edit_thread') && (
                        <Link
                          to={`/agency/dockets/${docket.id}/edit`}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Edit ${docket.title}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedDockets.length)} of {sortedDockets.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DocketList