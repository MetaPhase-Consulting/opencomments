import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SecurityBanner from '../components/SecurityBanner'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const AgencyLogin = () => {
  const { user, profile } = useAuth()
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in
  if (user && profile) {
    if (profile.role === 'agency') {
      return <Navigate to="/agency-dashboard" replace />
    } else if (profile.role === 'public') {
      return <Navigate to="/dashboard" replace />
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            agency_name: agencyName,
            role: 'agency',
          },
        },
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            agency_name: agencyName,
            role: 'agency',
          })

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
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
              Agency Login
            </h1>
            <p className="text-gray-600">
              Access your agency's comment management console
            </p>
          </div>

          <div className="mb-6">
            <div className="flex rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setView('sign_in')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  view === 'sign_in'
                    ? 'text-white'
                    : 'text-gray-700 hover:text-red-600'
                }`}
                style={{
                  backgroundColor: view === 'sign_in' ? '#D9253A' : 'transparent'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setView('sign_up')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  view === 'sign_up'
                    ? 'text-white'
                    : 'text-gray-700 hover:text-red-600'
                }`}
                style={{
                  backgroundColor: view === 'sign_up' ? '#D9253A' : 'transparent'
                }}
              >
                Sign Up
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={view === 'sign_in' ? handleSignIn : handleSignUp}>
            {view === 'sign_up' && (
              <>
                <div className="mb-4">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    id="agencyName"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
              style={{ backgroundColor: '#D9253A' }}
            >
              {loading ? 'Loading...' : view === 'sign_in' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Are you a member of the public?{' '}
              <Link
                to="/login"
                className="text-blue-700 hover:text-blue-800 underline"
              >
                Public Login
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default AgencyLogin