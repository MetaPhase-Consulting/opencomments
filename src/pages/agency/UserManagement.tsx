import React, { useState } from 'react'
import { useAgencyUsers } from '../../hooks/useAgencyUsers'
import { usePermissions } from '../../hooks/usePermissions'
import { useAgency } from '../../contexts/AgencyContext'
import { PermissionGate, PermissionButton } from '../../components/PermissionGate'
import { RoleBadge } from '../../components/RoleBadge'
import { AgencyRole, AGENCY_ROLES, getRoleHierarchy } from '../../types/roles'
import { 
  Users, 
  UserPlus, 
  Mail, 
  MoreHorizontal, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Trash2,
  Edit3,
  User,
  Calendar,
  Filter
} from 'lucide-react'

type StatusFilter = 'all' | 'active' | 'pending' | 'deactivated'

const UserManagement = () => {
  const { currentAgency } = useAgency()
  const { hasPermission, canManageRole, userRole } = usePermissions(currentAgency?.id)
  const { 
    users, 
    invitations, 
    loading, 
    error, 
    inviteUser, 
    changeUserRole, 
    changeUserStatus,
    resendInvitation,
    revokeInvitation 
  } = useAgencyUsers()

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AgencyRole>('reviewer')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')

  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newRole, setNewRole] = useState<AgencyRole>('reviewer')
  const [roleChangeLoading, setRoleChangeLoading] = useState(false)

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate'>('deactivate')
  const [statusLoading, setStatusLoading] = useState(false)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const roleHierarchy = getRoleHierarchy()
  const canManageUsers = hasPermission('invite_users')

  // Filter users based on status and search
  const filteredUsers = users.filter(user => {
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesSearch = !searchQuery || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  // Filter invitations based on search
  const filteredInvitations = invitations.filter(invitation => {
    return !searchQuery || invitation.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviteLoading(true)
    setInviteError('')

    try {
      await inviteUser(inviteEmail.trim(), inviteRole)
      setInviteEmail('')
      setInviteRole('reviewer')
      setShowInviteModal(false)
      // Show success message
    } catch (error: any) {
      setInviteError(error.message || 'Failed to send invitation')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRoleChange = async () => {
    if (!selectedUser) return

    setRoleChangeLoading(true)
    try {
      await changeUserRole(selectedUser.id, newRole)
      setShowRoleModal(false)
      setSelectedUser(null)
      // Show success message
    } catch (error: any) {
      console.error('Error changing role:', error)
      // Show error message
    } finally {
      setRoleChangeLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedUser) return

    setStatusLoading(true)
    try {
      const newStatus = statusAction === 'activate' ? 'active' : 'deactivated'
      await changeUserStatus(selectedUser.id, newStatus)
      setShowStatusModal(false)
      setSelectedUser(null)
      // Show success message
    } catch (error: any) {
      console.error('Error changing status:', error)
      // Show error message
    } finally {
      setStatusLoading(false)
    }
  }

  const handleResendInvite = async (invitationId: string) => {
    try {
      await resendInvitation(invitationId)
      // Show success message
    } catch (error: any) {
      console.error('Error resending invitation:', error)
      // Show error message
    }
  }

  const handleRevokeInvite = async (invitationId: string) => {
    try {
      await revokeInvitation(invitationId)
      // Show success message
    } catch (error: any) {
      console.error('Error revoking invitation:', error)
      // Show error message
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'deactivated':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Show self-service view for non-admins
  if (!canManageUsers) {
    const currentUser = users.find(u => u.user_id === currentAgency?.id) // This would need proper user matching
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Access</h1>
          <p className="text-gray-600 mt-1">Your role and permissions in this agency</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {currentUser?.full_name || currentUser?.email}
              </h2>
              <p className="text-gray-600">{currentUser?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Role</h3>
              {userRole && <RoleBadge role={userRole} showDescription />}
            </div>
            
            {currentUser?.joined_at && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Joined</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(currentUser.joined_at)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                // Open support email or form
                window.location.href = 'mailto:support@opencomments.us?subject=Access Request'
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              <Mail className="w-4 h-4 mr-2" />
              Request Higher Access
            </button>
          </div>
        </div>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
        </div>
        
        <PermissionButton
          permission="invite_users"
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </PermissionButton>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search users by name or email..."
            />
          </div>
          
          <div className="sm:w-48">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Team Members ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={user.status === 'deactivated' ? 'opacity-60' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || user.email}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.joined_at ? formatDate(user.joined_at) : 'Pending'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canManageRole(user.role) && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role)
                            setShowRoleModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Change role"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setStatusAction(user.status === 'active' ? 'deactivate' : 'activate')
                            setShowStatusModal(true)
                          }}
                          className={`p-1 rounded focus:outline-none focus:ring-2 ${
                            user.status === 'active'
                              ? 'text-red-600 hover:text-red-800 focus:ring-red-500'
                              : 'text-green-600 hover:text-green-800 focus:ring-green-500'
                          }`}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'active' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by inviting your first team member.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {filteredInvitations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Invitations ({filteredInvitations.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredInvitations.map((invitation) => (
              <div key={invitation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {invitation.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        Invited {formatDate(invitation.created_at)} • Expires {formatDate(invitation.expires_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <RoleBadge role={invitation.role} size="sm" />
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResendInvite(invitation.id)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded hover:bg-blue-100"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Resend
                      </button>
                      
                      <button
                        onClick={() => handleRevokeInvite(invitation.id)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-300 rounded hover:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Invite Team Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {inviteError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-600">{inviteError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleInviteSubmit}>
                <div className="mb-4">
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="colleague@agency.gov"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="inviteRole" className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Role
                  </label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AgencyRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roleHierarchy.filter(role => canManageRole(role)).map(role => (
                      <option key={role} value={role}>
                        {AGENCY_ROLES[role].name} - {AGENCY_ROLES[role].description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change Role for {selectedUser.full_name || selectedUser.email}
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role
                </label>
                <div className="space-y-2">
                  {roleHierarchy.filter(role => canManageRole(role)).map(role => (
                    <label key={role} className="flex items-center">
                      <input
                        type="radio"
                        name="newRole"
                        value={role}
                        checked={newRole === role}
                        onChange={(e) => setNewRole(e.target.value as AgencyRole)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {AGENCY_ROLES[role].name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {AGENCY_ROLES[role].description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={roleChangeLoading || newRole === selectedUser.role}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {roleChangeLoading ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {statusAction === 'activate' ? 'Activate' : 'Deactivate'} User
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to {statusAction} {selectedUser.full_name || selectedUser.email}?
                {statusAction === 'deactivate' && ' This will prevent them from accessing the agency portal.'}
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={statusLoading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    statusAction === 'activate'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {statusLoading ? 'Processing...' : statusAction === 'activate' ? 'Activate' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement