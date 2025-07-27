import React, { useState } from 'react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useAgency } from '../../contexts/AgencyContext'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import SecurityBanner from '../../components/SecurityBanner'
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react'

const AgencyLogin = () => {
  const { user } = useAuth()
  const { hasAgencyAccess, loading: agencyLoading } = useAgency()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // Redirect if already authenticated with agency access
  if (user && !agencyLoading && hasAgencyAccess) {
    const from = location.state?.from?.pathname || '/agency/dashboard'
    return <Navigate to={from} replace />
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        // Generic error message to avoid user enumeration
        setError('Invalid email or password.')
      } else {
        // Navigation will be handled by the auth state change
        // and AgencyProtectedRoute logic
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/agency/reset-password`
      })

      if (error) {
        setError('Unable to send reset email. Please contact your administrator.')
      } else {
        setResetEmailSent(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Agency Log In
            </h1>
            <p className="text-gray-600">
              Log in with the credentials sent in your staff invite email.
            </p>
          </div>

          {resetEmailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Reset Email Sent
              </h2>
              <p className="text-gray-600 mb-6">
                Check your email for password reset instructions.
              </p>
              <button
                onClick={() => setResetEmailSent(false)}
                className="text-blue-700 hover:text-blue-800 underline"
              >
                Back to login
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <form onSubmit={handleSignIn}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@agency.gov"
                    required
                    aria-describedby="email-error"
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
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      aria-describedby="password-error"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 text-white font-medium rounded-md bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Signing in...' : 'Log In'}
                  </button>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full py-2 px-4 text-blue-700 font-medium border border-blue-700 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Forgot Password
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need access?{' '}
                  <span className="text-gray-800">Contact your agency administrator</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <Link
                    to="/login"
                    className="text-blue-700 hover:text-blue-800 underline"
                  >
                    Public comment login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default AgencyLogin