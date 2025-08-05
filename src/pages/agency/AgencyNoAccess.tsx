import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAgency } from '../../contexts/AgencyContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SecurityBanner from '../../components/SecurityBanner'
import { AlertTriangle, Mail, ArrowLeft } from 'lucide-react'

const AgencyNoAccess = () => {
  const { user, signOut } = useAuth()
  const { hasAgencyAccess, loading } = useAgency()

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/agency/login" replace />
  }

  // Redirect if user actually has agency access
  if (!loading && hasAgencyAccess) {
    return <Navigate to="/agency/dashboard" replace />
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <SecurityBanner />
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Agency Access
          </h1>
          
          <div className="max-w-md mx-auto mb-8">
            <p className="text-gray-600 mb-4">
              Your account is active but not linked to an agency. Contact an Owner or Admin to be invited.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 mb-1">
                    Signed in as:
                  </h3>
                  <p className="text-sm text-blue-700">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign Out
              </button>
              
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-700 bg-white border border-blue-700 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </div>
            
            <p className="text-sm text-gray-500">
              Need help? Contact your agency administrator or{' '}
              <a 
                href="/contact" 
                className="text-blue-700 hover:text-blue-800 underline"
              >
                technical support
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default AgencyNoAccess