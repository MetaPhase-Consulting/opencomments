import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAgency } from '../contexts/AgencyContext'
import AdminLayout from './AdminLayout'

interface AgencyProtectedRouteProps {
  children: React.ReactNode
}

const AgencyProtectedRoute: React.FC<AgencyProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const { currentAgency, availableAgencies, loading: agencyLoading, hasAgencyAccess } = useAgency()
  const location = useLocation()

  // Show loading spinner while checking auth/agency status
  if (authLoading || agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/agency/login" state={{ from: location }} replace />
  }

  // Show no access screen if user has no agency memberships
  if (!hasAgencyAccess) {
    return <Navigate to="/agency/no-access" replace />
  }

  // Redirect to agency selector if user has multiple agencies but none selected
  if (availableAgencies.length > 1 && !currentAgency) {
    return <Navigate to="/agency/select" replace />
  }

  // Render protected content within AdminLayout
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}

export default AgencyProtectedRoute