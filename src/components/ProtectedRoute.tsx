import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute