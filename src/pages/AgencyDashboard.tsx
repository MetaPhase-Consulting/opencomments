import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SecurityBanner from '../components/SecurityBanner'
import { 
  Plus, 
  FileText, 
  MessageSquare, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  Building2,
  TrendingUp,
  Shield
} from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'
import { PermissionGate, PermissionButton } from '../components/PermissionGate'
import { RoleBadge } from '../components/RoleBadge'

interface Docket {
  id: string
  title: string
  description: string
  status: 'draft' | 'open' | 'closed'
  comment_deadline: string
  created_at: string
  comment_count: number
}

interface DashboardStats {
  total_dockets: number
  active_dockets: number
  total_comments: number
  pending_review: number
}

const AgencyDashboard = () => {
  const { user, profile, signOut } = useAuth()
  const { userRole, currentMembership } = usePermissions(user?.id) // Using user ID as agency ID for now
  const [dockets, setDockets] = useState<Docket[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total_dockets: 0,
    active_dockets: 0,
    total_comments: 0,
    pending_review: 0
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'dockets' | 'comments' | 'settings'>('overview')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDockets()
      fetchStats()
    }
  }, [user])

  const fetchDockets = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('dockets')
        .select(`
          id,
          title,
          description,
          status,
          comment_deadline,
          created_at,
          comments (count)
        `)
        .eq('agency_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching dockets:', error)
        return
      }

      const formattedDockets = data?.map(docket => ({
        id: docket.id,
        title: docket.title,
        description: docket.description,
        status: docket.status,
        comment_deadline: docket.comment_deadline,
        created_at: docket.created_at,
        comment_count: docket.comments?.length || 0
      })) || []

      setDockets(formattedDockets)
    } catch (error) {
      console.error('Error fetching dockets:', error)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      // Get docket counts
      const { data: docketData, error: docketError } = await supabase
        .from('dockets')
        .select('status')
        .eq('agency_id', user.id)

      if (docketError) {
        console.error('Error fetching docket stats:', docketError)
        return
      }

      const totalDockets = docketData?.length || 0
      const activeDockets = docketData?.filter(d => d.status === 'open').length || 0

      // Get comment counts
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .select('status, dockets!inner(agency_id)')
        .eq('dockets.agency_id', user.id)

      if (commentError) {
        console.error('Error fetching comment stats:', commentError)
        return
      }

      const totalComments = commentData?.length || 0
      const pendingReview = commentData?.filter(c => c.status === 'under_review').length || 0

      setStats({
        total_dockets: totalDockets,
        active_dockets: activeDockets,
        total_comments: totalComments,
        pending_review: pendingReview
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SecurityBanner />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#D9253A' }}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.agency_name || 'Agency Dashboard'}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-gray-600">
                    Welcome back, {profile?.full_name || user?.email}
                  </p>
                  {userRole && <RoleBadge role={userRole} size="sm" />}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'text-white border-red-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  color: activeTab === 'overview' ? '#D9253A' : undefined,
                  borderColor: activeTab === 'overview' ? '#D9253A' : undefined
                }}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <PermissionButton
                permission="create_thread"
                onClick={() => setActiveTab('dockets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dockets'
                    ? 'text-white border-red-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  color: activeTab === 'dockets' ? '#D9253A' : undefined,
                  borderColor: activeTab === 'dockets' ? '#D9253A' : undefined
                }}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Dockets ({dockets.length})
              </PermissionButton>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comments'
                    ? 'text-white border-red-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  color: activeTab === 'comments' ? '#D9253A' : undefined,
                  borderColor: activeTab === 'comments' ? '#D9253A' : undefined
                }}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Comments ({stats.total_comments})
              </button>
              <PermissionGate permission="invite_users">
                <button
                  onClick={() => setActiveTab('team')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'team'
                      ? 'text-white border-red-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{
                    color: activeTab === 'team' ? '#D9253A' : undefined,
                    borderColor: activeTab === 'team' ? '#D9253A' : undefined
                  }}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Team
                </button>
              </PermissionGate>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'text-white border-red-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={{
                  color: activeTab === 'settings' ? '#D9253A' : undefined,
                  borderColor: activeTab === 'settings' ? '#D9253A' : undefined
                }}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Dockets</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_dockets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Dockets</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_dockets}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Comments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_comments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending_review}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Dockets */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Dockets</h2>
                  <button
                    onClick={() => setActiveTab('dockets')}
                    className="text-sm font-medium hover:text-red-700 transition-colors"
                    style={{ color: '#D9253A' }}
                  >
                    View all
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {dockets.slice(0, 5).map((docket) => (
                  <div key={docket.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {docket.title}
                        </h3>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {docket.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          Deadline: {formatDate(docket.comment_deadline)}
                          {isDeadlineSoon(docket.comment_deadline) && (
                            <span className="ml-2 text-orange-600 font-medium">
                              (Soon!)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                          {docket.comment_count} comments
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(docket.status)}`}>
                          {docket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {dockets.length === 0 && (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No dockets yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first docket to start collecting public comments
                    </p>
                    <PermissionButton
                      permission="create_thread"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors hover:bg-red-700"
                      style={{ backgroundColor: '#D9253A' }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Docket
                    </PermissionButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dockets' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Manage Dockets</h2>
                <PermissionButton
                  permission="create_thread"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors hover:bg-red-700"
                  style={{ backgroundColor: '#D9253A' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Docket
                </PermissionButton>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {dockets.map((docket) => (
                <div key={docket.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {docket.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {docket.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created: {formatDate(docket.created_at)} • 
                        Deadline: {formatDate(docket.comment_deadline)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {docket.comment_count} comments
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(docket.status)}`}>
                        {docket.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Comment Management</h2>
              <p className="text-gray-600 mt-1">Review and moderate public comments</p>
            </div>
            
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Comment management coming soon</h3>
              <p className="text-gray-600">
                This feature will allow you to review, approve, and respond to public comments
              </p>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <PermissionGate 
            permission="invite_users"
            fallback={
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                <p className="text-gray-600">You don't have permission to manage team members</p>
              </div>
            }
          >
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
                <p className="text-gray-600 mt-1">Manage roles and permissions for your agency</p>
              </div>
              
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Team management coming soon</h3>
                <p className="text-gray-600 mb-4">
                  This feature will allow you to invite team members and manage their roles
                </p>
                <div className="text-sm text-gray-500">
                  <p className="mb-2">Available roles:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <RoleBadge role="owner" size="sm" />
                    <RoleBadge role="admin" size="sm" />
                    <RoleBadge role="manager" size="sm" />
                    <RoleBadge role="reviewer" size="sm" />
                    <RoleBadge role="viewer" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </PermissionGate>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Agency Settings</h2>
              <p className="text-gray-600 mt-1">Manage your agency profile and preferences</p>
            </div>
            
            <div className="p-6">
              <div className="max-w-2xl">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      value={profile?.agency_name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={profile?.full_name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  
                  <div className="pt-4">
                    <PermissionButton
                      permission="edit_agency_settings"
                      className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors hover:bg-red-700"
                      style={{ backgroundColor: '#D9253A' }}
                    >
                      Update Settings
                    </PermissionButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}

export default AgencyDashboard