import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SecurityBanner from '../components/SecurityBanner'

const PublicLogin = () => {
  const { user, profile } = useAuth()
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')

  // Redirect if already logged in
  if (user && profile) {
    if (profile.role === 'public') {
      return <Navigate to="/dashboard" replace />
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

          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0050D8',
                    brandAccent: '#003fb5',
                  },
                },
              },
            }}
            providers={['github', 'google']}
            redirectTo={`${window.location.origin}/dashboard`}
            onlyThirdPartyProviders={false}
          />

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