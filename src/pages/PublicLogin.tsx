import React, { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { validatePassword, sanitizeInput, validateEmail } from '../lib/validation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SecurityBanner from '../components/SecurityBanner'
import { Eye, EyeOff, AlertCircle, Github } from 'lucide-react'
import { PasswordValidationResult } from '../lib/validation'

const PublicLogin = () => {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get('next')
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null)

  // Redirect if already logged in
  if (user && profile) {
    if (profile.role === 'public') {
      return <Navigate to={nextUrl || "/dashboard"} replace />
    } else if (profile.role === 'agency') {
      return <Navigate to="/agency-dashboard" replace />
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const sanitizedEmail = sanitizeInput(email)
      if (!validateEmail(sanitizedEmail)) {
        setError('Please enter a valid email address')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      })

      if (error) {
        // Provide more specific error messages while avoiding user enumeration
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account')
        } else if (error.message.includes('Too many requests')) {
          setError('Too many login attempts. Please try again later')
        } else {
          setError('An error occurred. Please try again')
        }
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
      const sanitizedEmail = sanitizeInput(email)
      const sanitizedFullName = sanitizeInput(fullName)

      if (!validateEmail(sanitizedEmail)) {
        setError('Please enter a valid email address')
        return
      }

      if (view === 'sign_up') {
        const passwordCheck = validatePassword(password)
        if (!passwordCheck.isValid) {
          setError(passwordCheck.errors.join(', '))
          return
        }
      }

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            full_name: sanitizedFullName,
            role: 'public'
          }
        }
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists')
        } else if (error.message.includes('Password should be at least')) {
          setError('Password does not meet security requirements')
        } else {
          setError('Failed to create account. Please try again')
        }
      } else {
        setError('')
        // Show success message or redirect
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    
    if (view === 'sign_up' && newPassword.length > 0) {
      setPasswordValidation(validatePassword(newPassword))
    } else {
      setPasswordValidation(null)
    }
  }

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'strong': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const handleGitHubSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}${nextUrl || '/dashboard'}`
        }
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

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${nextUrl || '/dashboard'}`
        }
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="w-5 h-5 mr-2" />
              Continue with GitHub
            </button>
            
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={view === 'sign_in' ? handleSignIn : handleSignUp}>
            {view === 'sign_up' && (
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {view === 'sign_up' && passwordValidation && (
                <p className={`mt-2 text-sm ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                  Password strength: {passwordValidation.strength}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 text-white font-medium rounded-md bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : view === 'sign_in' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

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