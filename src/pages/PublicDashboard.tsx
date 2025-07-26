import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SecurityBanner from '../components/SecurityBanner'
import { Search, MessageSquare, Bookmark, Clock, User, LogOut } from 'lucide-react'

interface Comment {
  id: string
  docket_id: string
  content: string
  created_at: string
  docket_title: string
  agency_name: string
  status: 'submitted' | 'under_review' | 'published'
}

interface SavedDocket {
  id: string
  docket_id: string
  title: string
  agency_name: string
  comment_deadline: string
  saved_at: string
}

const PublicDashboard = () => {
  const { user, profile, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [savedDockets, setSavedDockets] = useState<SavedDocket[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'comments' | 'saved'>('search')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserComments()
      fetchSavedDockets()
    }
  }, [user])

  const fetchUserComments = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          docket_id,
          content,
          created_at,
          status,
          dockets (
            title,
            agency_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching comments:', error)
        return
      }

      const formattedComments = data?.map(comment => ({
        id: comment.id,
        docket_id: comment.docket_id,
        content: comment.content,
        created_at: comment.created_at,
        status: comment.status,
        docket_title: comment.dockets?.title || 'Unknown Docket',
        agency_name: comment.dockets?.agency_name || 'Unknown Agency'
      })) || []

      setComments(formattedComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchSavedDockets = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('saved_dockets')
        .select(`
          id,
          docket_id,
          saved_at,
          dockets (
            title,
            agency_name,
            comment_deadline
          )
        `)
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (error) {
        console.error('Error fetching saved dockets:', error)
        return
      }

      const formattedSaved = data?.map(saved => ({
        id: saved.id,
        docket_id: saved.docket_id,
        title: saved.dockets?.title || 'Unknown Docket',
        agency_name: saved.dockets?.agency_name || 'Unknown Agency',
        comment_deadline: saved.dockets?.comment_deadline || '',
        saved_at: saved.saved_at
      })) || []

      setSavedDockets(formattedSaved)
    } catch (error) {
      console.error('Error fetching saved dockets:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'published':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SecurityBanner />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {profile?.full_name || user?.email}
                </h1>
                <p className="text-gray-600">
                  Manage your comments and track government dockets
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Search Dockets
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                My Comments ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'saved'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bookmark className="w-4 h-4 inline mr-2" />
                Saved Dockets ({savedDockets.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Search Government Dockets
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find open comment periods for government proposals, regulations, and policy changes
              </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Search dockets by keyword, agency, or topic..."
                  aria-label="Search dockets"
                />
              </div>
              <div className="mt-4 text-center">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Search Dockets
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Your Comment History</h2>
              <p className="text-gray-600 mt-1">Track the status of your submitted comments</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {comments.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">
                    Start by searching for dockets and submitting your first comment
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {comment.docket_title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {comment.agency_name} • {formatDate(comment.created_at)}
                        </p>
                        <p className="text-gray-700 mb-3 line-clamp-3">
                          {comment.content}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(comment.status)}`}>
                        {comment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Saved Dockets</h2>
              <p className="text-gray-600 mt-1">Dockets you've bookmarked for later</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {savedDockets.length === 0 ? (
                <div className="p-8 text-center">
                  <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved dockets</h3>
                  <p className="text-gray-600">
                    Save dockets you're interested in to keep track of comment deadlines
                  </p>
                </div>
              ) : (
                savedDockets.map((docket) => (
                  <div key={docket.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {docket.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {docket.agency_name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          Comment deadline: {formatDate(docket.comment_deadline)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Saved {formatDate(docket.saved_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  )
}

export default PublicDashboard