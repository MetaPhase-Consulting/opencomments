import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Clock,
  Users,
  HelpCircle
} from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  organization: string
  subject: string
  category: string
  message: string
}

const Contact = () => {
  const { user, profile } = useAuth()
  const [formData, setFormData] = useState<ContactForm>({
    name: profile?.full_name || '',
    email: user?.email || '',
    organization: profile?.agency_name || '',
    subject: '',
    category: 'general_inquiry',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'technical_support', label: 'Technical Support', icon: HelpCircle },
    { value: 'account_access', label: 'Account Access Issues', icon: Users },
    { value: 'agency_setup', label: 'Agency Setup Help', icon: MapPin },
    { value: 'feature_request', label: 'Feature Request', icon: MessageSquare },
    { value: 'bug_report', label: 'Bug Report', icon: AlertCircle },
    { value: 'training_request', label: 'Training Request', icon: Clock },
    { value: 'billing_question', label: 'Billing Question', icon: Mail },
    { value: 'general_inquiry', label: 'General Inquiry', icon: Mail }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        throw new Error('Please fill in all required fields')
      }

      // Submit to database
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert({
          user_id: user?.id || null,
          name: formData.name.trim(),
          email: formData.email.trim(),
          organization: formData.organization.trim() || null,
          subject: formData.subject.trim(),
          category: formData.category,
          message: formData.message.trim(),
          user_agent: navigator.userAgent,
          ip_address: null // Will be set by server if needed
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to submit your message. Please try again.')
      }

      // Send email via edge function (placeholder for now)
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
          body: {
            name: formData.name,
            email: formData.email,
            organization: formData.organization,
            subject: formData.subject,
            category: formData.category,
            message: formData.message
          }
        })

        if (emailError) {
          console.warn('Email sending failed:', emailError)
          // Don't fail the submission if email fails
        }
      } catch (emailError) {
        console.warn('Email function not available:', emailError)
        // Continue with successful submission
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
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
                  setSubmitted(false);
                  setFormData({
                    name: profile?.full_name || '',
                    email: user?.email || '',
                    organization: profile?.agency_name || '',
                    subject: '',
                    category: 'general_inquiry',
                    message: ''
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
            Get help with OpenComments, request features, or ask questions about public commenting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Support</h3>
                    <p className="text-sm text-gray-600">
                      <a href="mailto:support@opencomments.us" className="text-blue-700 hover:text-blue-800 underline">
                        support@opencomments.us
                      </a>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Response within 1-2 business days</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Phone Support</h3>
                    <p className="text-sm text-gray-600">1-800-COMMENTS</p>
                    <p className="text-xs text-gray-500 mt-1">Mon-Fri, 9 AM - 5 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">System Status</h3>
                    <p className="text-sm text-gray-600">
                      <a 
                        href="https://status.opencomments.us" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-800 underline"
                      >
                        status.opencomments.us
                      </a>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Check service availability</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <a href="/help" className="block text-sm text-blue-700 hover:text-blue-800 underline">
                    Help Center
                  </a>
                  <a href="/api" className="block text-sm text-blue-700 hover:text-blue-800 underline">
                    API Documentation
                  </a>
                  <a href="/training" className="block text-sm text-blue-700 hover:text-blue-800 underline">
                    Training Resources
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide details about your inquiry..."
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
                    disabled={loading}
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
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Government Agencies</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">How do I set up my agency?</h4>
                  <p className="text-sm text-gray-600">Contact us to get started with agency setup and user training.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Is OpenComments secure?</h4>
                  <p className="text-sm text-gray-600">Yes, we use enterprise-grade security with SOC 2 compliance and government-standard data protection.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Can I export comment data?</h4>
                  <p className="text-sm text-gray-600">Yes, you can export comments as CSV files and attachments as ZIP bundles for archival and analysis.</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">For Citizens</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">How do I submit a comment?</h4>
                  <p className="text-sm text-gray-600">Create an account, find the relevant docket, and submit your feedback through the comment form.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Are my comments public?</h4>
                  <p className="text-sm text-gray-600">Yes, approved comments become part of the public record, but your email address remains private.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Can I track my submissions?</h4>
                  <p className="text-sm text-gray-600">Yes, your dashboard shows all submitted comments and their approval status.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default Contact