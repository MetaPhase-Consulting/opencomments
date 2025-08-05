import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { sanitizeInput, validateEmail } from '../lib/validation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import HCaptchaComponent from '../components/HCaptcha';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react'

interface ContactForm {
  userType: string
  name: string
  email: string
  organization: string
  subject: string
  category: string
  message: string
  captchaToken: string
}

const Contact = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ContactForm>({
    userType: 'citizen',
    name: '',
    email: '',
    organization: '',
    subject: '',
    category: 'general_inquiry',
    message: '',
    captchaToken: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const updateFormData = (field: keyof ContactForm, value: string) => {
    setFormData((prev: ContactForm) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.userType || !formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        throw new Error('Please fill in all required fields')
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address')
      }

      if (!formData.captchaToken) {
        throw new Error('Please complete the CAPTCHA verification')
      }

      // Sanitize inputs
      const sanitizedData = {
        user_id: user?.id || null,
        user_type: sanitizeInput(formData.userType),
        name: sanitizeInput(formData.name.trim()),
        email: sanitizeInput(formData.email.trim()),
        organization: sanitizeInput(formData.organization.trim()) || null,
        subject: sanitizeInput(formData.subject.trim()),
        category: sanitizeInput(formData.category),
        message: sanitizeInput(formData.message.trim()),
        user_agent: navigator.userAgent,
        ip_address: null // Will be set by server if needed
      }

      // Submit to database
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert(sanitizedData)

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to submit your message. Please try again.')
      }

      // Send email via edge function (placeholder for now)
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
          body: sanitizedData
        })

        if (emailError) {
          console.warn('Email sending failed:', emailError)
          // Don't fail the submission if email fails
        }
      } catch (emailError) {
        console.warn('Email function not available:', emailError)
        // Continue with successful submission
      }

      setSuccess(true)
      setFormData({
        userType: 'citizen',
        name: '',
        email: '',
        organization: '',
        subject: '',
        category: 'general_inquiry',
        message: '',
        captchaToken: ''
      })
    } catch (err: any) {
      setError(err.message || 'Failed to submit your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <SecurityBanner />
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Message Sent Successfully
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for contacting us. We've received your message and will respond within 1-2 business days.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    userType: 'citizen',
                    name: '',
                    email: '',
                    organization: '',
                    subject: '',
                    category: 'general_inquiry',
                    message: '',
                    captchaToken: ''
                  });
                }}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Send Another Message
              </button>
              <div className="text-sm text-gray-500">
                <p>Reference ID: {Date.now().toString(36).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get help, request features, or ask questions.
          </p>
        </div>




        {/* Contact Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              </div>
            )}


            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                  I am a <span className="text-red-500">*</span>
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={(e) => updateFormData('userType', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select user type...</option>
                  <option value="citizen">Citizen/Public User</option>
                  <option value="government">Government/Agency User</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@agency.gov"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={formData.organization}
                  onChange={(e) => updateFormData('organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your organization or agency"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => updateFormData('category', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  <option value="technical_support">Technical Support</option>
                  <option value="account_access">Login Issues</option>
                  <option value="agency_onboarding">Agency Onboarding</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="bug_report">Bug Report</option>
                  <option value="training_request">Training Request</option>
                  <option value="general_inquiry">General Inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => updateFormData('subject', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => updateFormData('message', e.target.value)}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              {/* CAPTCHA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Security Verification <span className="text-red-500">*</span>
                </label>
                <HCaptchaComponent
                  onVerify={(token) => {
                    setFormData(prev => ({ ...prev, captchaToken: token }));
                    setError('');
                  }}
                  onError={(error) => {
                    setFormData(prev => ({ ...prev, captchaToken: '' }));
                    setError('CAPTCHA verification failed. Please try again.');
                  }}
                  onExpire={() => {
                    setFormData(prev => ({ ...prev, captchaToken: '' }));
                    setError('CAPTCHA expired. Please verify again.');
                  }}
                  size="normal"
                  theme="light"
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.captchaToken}
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>


      </main>
      
      <Footer />
    </div>
  )
}

export default Contact