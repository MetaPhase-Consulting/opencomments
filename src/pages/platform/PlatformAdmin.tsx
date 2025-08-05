import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePlatformRoles } from '../../hooks/usePlatformRoles'
import { hasPlatformPermission, PLATFORM_ROLES, isApprovedDomain } from '../../types/platform'
import { AgencyRole, AGENCY_ROLES } from '../../types/roles'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SecurityBanner from '../../components/SecurityBanner'
import { 
  Building2, 
  UserPlus, 
  Crown, 
  Shield,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Mail,
  Users,
  Settings
} from 'lucide-react'

const PlatformAdmin = () => {
  const { user, platformRole } = useAuth()
  const { 
    platformUsers, 
    loading, 
    error, 
    createAgency, 
    inviteUserToAgency, 
    inviteSuperUser, 
    removeSuperUser 
  } = usePlatformRoles()

  const [activeTab, setActiveTab] = useState<'create-agency' | 'invite-user' | 'super-users'>('create-agency')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Agency creation form
  const [agencyForm, setAgencyForm] = useState({
    name: '',
    jurisdiction: '',
    jurisdiction_type: 'city' as const,
    description: '',
    owner_email: '',
    owner_name: ''
  })

  // User invitation form
  const [inviteForm, setInviteForm] = useState({
    agency_id: '',
    email: '',
    role: 'owner' as AgencyRole,
    full_name: ''
  })

  // Super user invitation form
  const [superUserForm, setSuperUserForm] = useState({
    email: '',
    full_name: ''
  })

  // Available agencies for user invitation (mock data - would fetch from backend)
  const [agencies] = useState([
    { id: '1', name: 'City of Springfield', jurisdiction: 'Springfield, IL' },
    { id: '2', name: 'County of Madison', jurisdiction: 'Madison County, IL' },
    { id: '3', name: 'Springfield School District', jurisdiction: 'Springfield, IL' }
  ])

  // Redirect if not authenticated or no platform role
  if (!user || !platformRole) {
    return <Navigate to="/login" replace />
  }

  // Check if user has platform admin access
  if (!hasPlatformPermission(platformRole, 'access_platform_admin')) {
    return <Navigate to="/unauthorized" replace />
  }

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      // Validate government email domain
      if (!agencyForm.owner_email.match(/\.(gov|edu)$/)) {
        throw new Error('Owner email must be from a government domain (.gov or .edu)')
      }

      const agencyId = await createAgency(agencyForm)
      
      setSuccessMessage(`Agency "${agencyForm.name}" created successfully! Agency ID: ${agencyId}`)
      setAgencyForm({
        name: '',
        jurisdiction: '',
        jurisdiction_type: 'city',
        description: '',
        owner_email: '',
        owner_name: ''
      })
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create agency')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      await inviteUserToAgency(inviteForm)
      
      setSuccessMessage(`User "${inviteForm.email}" invited successfully as ${AGENCY_ROLES[inviteForm.role].name}`)
      setInviteForm({
        agency_id: '',
        email: '',
        role: 'owner',
        full_name: ''
      })
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to invite user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInviteSuperUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSuccessMessage('')

    try {
      if (!isApprovedDomain(superUserForm.email)) {
        throw new Error('Email must be from an approved domain (metaphaseconsulting.com, metaphase.tech, or opencomments.us)')
      }

      await inviteSuperUser(superUserForm.email, superUserForm.full_name)
      
      setSuccessMessage(`Super User "${superUserForm.email}" invited successfully`)
      setSuperUserForm({
        email: '',
        full_name: ''
      })
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to invite super user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveSuperUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove super user access for ${email}?`)) {
      return
    }

    try {
      await removeSuperUser(userId)
      setSuccessMessage(`Super user access removed for ${email}`)
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to remove super user')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SecurityBanner />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Administration</h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Logged in as:</span>
                <span className="text-sm font-medium text-gray-900">{user.email}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {PLATFORM_ROLES[platformRole].name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm text-red-600">{submitError}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-green-600">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('create-agency')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'create-agency'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Create Agency
              </button>
              
              <button
                onClick={() => setActiveTab('invite-user')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'invite-user'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite User
              </button>
              
              {hasPlatformPermission(platformRole, 'manage_super_users') && (
                <button
                  onClick={() => setActiveTab('super-users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'super-users'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Super Users
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Create Agency Tab */}
            {activeTab === 'create-agency' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Create New Agency</h2>
                  <p className="text-gray-600">
                    Set up a new government agency with an initial owner account.
                  </p>
                </div>

                <form onSubmit={handleCreateAgency} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Agency Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="agency_name"
                        value={agencyForm.name}
                        onChange={(e) => setAgencyForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="City of Springfield"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="jurisdiction_type" className="block text-sm font-medium text-gray-700 mb-1">
                        Jurisdiction Type
                      </label>
                      <select
                        id="jurisdiction_type"
                        value={agencyForm.jurisdiction_type}
                        onChange={(e) => setAgencyForm(prev => ({ ...prev, jurisdiction_type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="city">City</option>
                        <option value="county">County</option>
                        <option value="state">State</option>
                        <option value="district">District</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
                        Jurisdiction
                      </label>
                      <input
                        type="text"
                        id="jurisdiction"
                        value={agencyForm.jurisdiction}
                        onChange={(e) => setAgencyForm(prev => ({ ...prev, jurisdiction: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Springfield, IL"
                      />
                    </div>

                    <div>
                      <label htmlFor="owner_email" className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="owner_email"
                        value={agencyForm.owner_email}
                        onChange={(e) => setAgencyForm(prev => ({ ...prev, owner_email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="admin@agency.gov"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be a .gov or .edu email address</p>
                    </div>

                    <div>
                      <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        id="owner_name"
                        value={agencyForm.owner_name}
                        onChange={(e) => setAgencyForm(prev => ({ ...prev, owner_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={agencyForm.description}
                      onChange={(e) => setAgencyForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Brief description of the agency..."
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Agency
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Invite User Tab */}
            {activeTab === 'invite-user' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Invite User to Agency</h2>
                  <p className="text-gray-600">
                    Add a user to an existing agency with the specified role.
                  </p>
                </div>

                <form onSubmit={handleInviteUser} className="space-y-6">
                  <div>
                    <label htmlFor="agency_select" className="block text-sm font-medium text-gray-700 mb-1">
                      Agency <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="agency_select"
                      value={inviteForm.agency_id}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, agency_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select an agency...</option>
                      {agencies.map(agency => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name} - {agency.jurisdiction}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="invite_email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="invite_email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="user@agency.gov"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="invite_role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="invite_role"
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as AgencyRole }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        {Object.entries(AGENCY_ROLES).map(([role, info]) => (
                          <option key={role} value={role}>
                            {info.name} - {info.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="invite_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="invite_name"
                        value={inviteForm.full_name}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Inviting...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Invite User
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Super Users Tab */}
            {activeTab === 'super-users' && hasPlatformPermission(platformRole, 'manage_super_users') && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Manage Super Users</h2>
                  <p className="text-gray-600">
                    Invite and manage platform administrators with super user access.
                  </p>
                </div>

                {/* Invite Super User Form */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-md font-semibold text-purple-900 mb-4">Invite New Super User</h3>
                  
                  <form onSubmit={handleInviteSuperUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="super_email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="super_email"
                          value={superUserForm.email}
                          onChange={(e) => setSuperUserForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="user@agency.gov"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Must be from approved domain (metaphaseconsulting.com, metaphase.tech, or opencomments.us)
                        </p>
                      </div>

                      <div>
                        <label htmlFor="super_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="super_name"
                          value={superUserForm.full_name}
                          onChange={(e) => setSuperUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="John Smith"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Inviting...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Invite Super User
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Super Users */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Current Super Users</h3>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                  ) : platformUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No super users found</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Added
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {platformUsers.map((platformUser) => (
                            <tr key={platformUser.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {platformUser.full_name || platformUser.email}
                                  </div>
                                  <div className="text-sm text-gray-500">{platformUser.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  platformUser.platform_role === 'super_owner'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {platformUser.platform_role === 'super_owner' ? (
                                    <Crown className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Shield className="w-3 h-3 mr-1" />
                                  )}
                                  {PLATFORM_ROLES[platformUser.platform_role!].name}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(platformUser.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {platformUser.platform_role === 'super_user' && (
                                  <button
                                    onClick={() => handleRemoveSuperUser(platformUser.id, platformUser.email)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                    title="Remove super user"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default PlatformAdmin