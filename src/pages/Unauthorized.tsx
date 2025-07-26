import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SecurityBanner from '../components/SecurityBanner'
import { AlertTriangle } from 'lucide-react'

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            You don't have permission to access this page. Please make sure you're logged in with the correct account type.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Public Login
              </Link>
              <Link
                to="/agency-login"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium border-2 rounded-lg transition-colors hover:bg-red-600 hover:text-white"
                style={{ 
                  color: '#D9253A', 
                  borderColor: '#D9253A'
                }}
              >
                Agency Login
              </Link>
            </div>
            
            <p className="text-sm text-gray-500">
              <Link to="/" className="text-blue-700 hover:text-blue-800 underline">
                Return to homepage
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default Unauthorized