import React, { useState, useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

const PublicLogin = () => {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get('next')
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')

  // Redirect if already logged in
  if (user && profile) {
    if (profile.role === 'public') {
      return <Navigate to={nextUrl || "/dashboard"} replace />
    } else if (profile.role === 'agency') {
      return <Navigate to="/agency-dashboard" replace />
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Public Login
            </h1>
            <p className="text-gray-600">
              Sign in to submit comments and track your submissions
            </p>
          </div>

          <div className="mb-6">
            <div className="flex rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setView('sign_in')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  view === 'sign_in'
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-700 hover:text-blue-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setView('sign_up')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  view === 'sign_up'
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-700 hover:text-blue-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="text-center py-8">
            <p className="text-gray-600">
              Public login functionality will be implemented with Supabase Auth UI.
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Are you a government agency?{' '}
              <Link
                to="/agency-login"
                className="text-blue-700 hover:text-blue-800 underline"
              >
                Agency Login
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default PublicLogin