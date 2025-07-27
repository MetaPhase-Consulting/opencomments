import React, { useState } from 'react'
import { AgencyRole, AGENCY_ROLES, getRoleHierarchy } from '../types/roles'
import { usePermissions } from '../hooks/usePermissions'
import { RoleBadge } from './RoleBadge'
import { PermissionButton } from './PermissionGate'
import { ChevronDown, UserPlus, Settings, AlertTriangle } from 'lucide-react'

interface AgencyUser {
  id: string
  email: string
  full_name?: string
  role: AgencyRole
  joined_at: string
  invited_by?: string
}

interface AgencyRoleManagerProps {
  agencyId: string
  users: AgencyUser[]
  onRoleChange: (userId: string, newRole: AgencyRole) => Promise<void>
  onInviteUser: (email: string, role: AgencyRole) => Promise<void>
  onRemoveUser: (userId: string) => Promise<void>
}

export const AgencyRoleManager: React.FC<AgencyRoleManagerProps> = ({
  agencyId,
  users,
  onRoleChange,
  onInviteUser,
  onRemoveUser
}) => {
  const { userRole, hasPermission, canManageRole } = usePermissions(agencyId)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<AgencyRole>('reviewer')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false)

  const roleHierarchy = getRoleHierarchy()
  const ownerCount = users.filter(u => u.role === 'owner').length

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    
    try {
      await onInviteUser(inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteRole('reviewer')
      setShowInviteForm(false)
    } catch (error) {
      console.error('Failed to invite user:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: AgencyRole) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    // Prevent removing last owner
    if (user.role === 'owner' && newRole !== 'owner' && ownerCount === 1) {
      alert('Cannot change role: Agency must have at least one owner')
      return
    }

    try {
      await onRoleChange(userId, newRole)
      setShowRoleChangeDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to change role:', error)
    }
  }

  const canRemoveUser = (user: AgencyUser): boolean => {
    // Cannot remove last owner
    if (user.role === 'owner' && ownerCount === 1) return false
    
    // Check if current user can manage this role
    return hasPermission('remove_users') && canManageRole(user.role)
  }

  if (!hasPermission('view_dashboard')) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">You don't have permission to view user management</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            <p className="text-gray-600 mt-1">Manage roles and permissions for your agency</p>
          </div>
          
          <PermissionButton
            permission="invite_users"
            agencyId={agencyId}
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </PermissionButton>
        </div>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="p-6 bg-blue-50 border-b border-blue-200">
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as AgencyRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roleHierarchy.filter(role => canManageRole(role)).map(role => (
                  <option key={role} value={role}>
                    {AGENCY_ROLES[role].name} - {AGENCY_ROLES[role].description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800"
              >
                Send Invitation
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User List */}
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.full_name || user.email}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(user.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <RoleBadge role={user.role} />
                
                {canManageRole(user.role) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user.id)
                        setShowRoleChangeDialog(true)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Change role"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    {canRemoveUser(user) && (
                      <button
                        onClick={() => onRemoveUser(user.id)}
                        className="p-1 text-red-400 hover:text-red-600 rounded"
                        title="Remove user"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Change Dialog */}
      {showRoleChangeDialog && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change User Role
            </h3>
            
            <div className="space-y-3">
              {roleHierarchy.filter(role => canManageRole(role)).map(role => {
                const user = users.find(u => u.id === selectedUser)
                const isCurrentRole = user?.role === role
                const isLastOwner = user?.role === 'owner' && role !== 'owner' && ownerCount === 1
                
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(selectedUser, role)}
                    disabled={isCurrentRole || isLastOwner}
                    className={`
                      w-full p-3 text-left rounded-lg border transition-colors
                      ${isCurrentRole 
                        ? 'bg-blue-50 border-blue-200 cursor-default' 
                        : isLastOwner
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                        : 'hover:bg-gray-50 border-gray-200 cursor-pointer'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {AGENCY_ROLES[role].name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {AGENCY_ROLES[role].description}
                        </div>
                      </div>
                      {isCurrentRole && (
                        <span className="text-xs text-blue-600 font-medium">Current</span>
                      )}
                      {isLastOwner && (
                        <span className="text-xs text-red-600 font-medium">Cannot remove last owner</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRoleChangeDialog(false)
                  setSelectedUser(null)
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgencyRoleManager