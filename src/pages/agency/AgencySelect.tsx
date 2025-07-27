import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAgency, AgencyInfo } from '../../contexts/AgencyContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SecurityBanner from '../../components/SecurityBanner'
import { RoleBadge } from '../../components/RoleBadge'
import { Building2, ChevronRight } from 'lucide-react'

const AgencySelect = () => {
  const { user } = useAuth()
  const { availableAgencies, setCurrentAgency, loading, hasAgencyAccess } = useAgency()
  const navigate = useNavigate()

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/agency/login" replace />
  }

  // Redirect if no agency access
  if (!loading && !hasAgencyAccess) {
    return <Navigate to="/agency/no-access" replace />
  }

  // Redirect if only one agency (should auto-select)
  if (!loading && availableAgencies.length === 1) {
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
            <p className="text-gray-600">Loading your agencies...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAgencySelect = (agency: AgencyInfo) => {
    setCurrentAgency(agency)
    navigate('/agency/dashboard')
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Select Your Agency
          </h1>
          <p className="text-gray-600">
            You have access to multiple agencies. Choose one to continue.
          </p>
        </div>

        <div className="space-y-3">
          {availableAgencies.map((agency) => (
            <button
              key={agency.id}
              onClick={() => handleAgencySelect(agency)}
              className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {agency.name}
                  </h3>
                  {agency.jurisdiction && (
                    <p className="text-sm text-gray-600 mb-2">
                      {agency.jurisdiction}
                    </p>
                  )}
                  <RoleBadge role={agency.role} showDescription />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't see your agency?{' '}
            <span className="text-gray-800">Contact your administrator</span>
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default AgencySelect