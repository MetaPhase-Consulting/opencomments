import React from 'react'
import { useAgency } from '../../contexts/AgencyContext'
import { RoleBadge } from '../../components/RoleBadge'
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Calendar,
  AlertCircle
} from 'lucide-react'

const AgencyDashboard = () => {
  const { currentAgency } = useAgency()

  // Mock stats - TODO: Replace with real data from backend
  const stats = {
    activeThreads: 3,
    totalComments: 127,
    pendingReview: 8,
    teamMembers: 5
  }

  const recentActivity = [
    {
      id: 1,
      type: 'comment',
      title: 'New comment on "Downtown Parking Regulations"',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'thread',
      title: 'Thread "City Budget 2024" opened for comments',
      time: '1 day ago',
      status: 'active'
    },
    {
      id: 3,
      type: 'user',
      title: 'Sarah Johnson invited as Reviewer',
      time: '2 days ago',
      status: 'completed'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to {currentAgency?.name}
            </h1>
            <div className="flex items-center space-x-3">
              <p className="text-gray-600">
                Agency Administration Dashboard
              </p>
              {currentAgency && (
                <RoleBadge role={currentAgency.role} />
              )}
            </div>
          </div>
          <LayoutDashboard className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Threads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeThreads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Comments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {activity.title}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {activity.time}
                  </div>
                </div>
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${activity.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                  ${activity.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                `}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Create New Thread</h3>
            <p className="text-sm text-gray-600">Start a new comment period</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left">
            <MessageSquare className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Review Comments</h3>
            <p className="text-sm text-gray-600">Moderate pending submissions</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left">
            <Users className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Invite Team Member</h3>
            <p className="text-sm text-gray-600">Add staff to your agency</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgencyDashboard