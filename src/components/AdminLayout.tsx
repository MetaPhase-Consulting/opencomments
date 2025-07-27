import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAgency } from '../contexts/AgencyContext'
import { RoleBadge } from './RoleBadge'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Shield, 
  Users, 
  Settings,
  ChevronDown,
  LogOut,
  Building2
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const { currentAgency } = useAgency()
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/agency/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/agency/dashboard'
    },
    {
      name: 'Threads',
      href: '/agency/threads',
      icon: MessageSquare,
      current: location.pathname.startsWith('/agency/threads')
    },
    {
      name: 'Moderation',
      href: '/agency/moderation',
      icon: Shield,
      current: location.pathname.startsWith('/agency/moderation')
    },
    {
      name: 'Users',
      href: '/agency/users',
      icon: Users,
      current: location.pathname.startsWith('/agency/users')
    },
    {
      name: 'Settings',
      href: '/agency/settings',
      icon: Settings,
      current: location.pathname.startsWith('/agency/settings')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-blue-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Agency Info */}
            <div className="flex items-center">
              <Building2 className="w-6 h-6 text-white mr-3" />
              <div className="text-white">
                <h1 className="text-lg font-semibold">
                  {currentAgency?.name || 'Agency Portal'}
                </h1>
                {currentAgency?.jurisdiction && (
                  <p className="text-xs text-blue-100">
                    {currentAgency.jurisdiction}
                  </p>
                )}
              </div>
            </div>

            {/* Right: User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center text-white hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 rounded-md px-3 py-2"
              >
                <span className="text-sm font-medium mr-2">
                  {user?.email}
                </span>
                {currentAgency && (
                  <div className="mr-2">
                    <RoleBadge role={currentAgency.role} size="sm" />
                  </div>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email}
                      </p>
                      {currentAgency && (
                        <div className="mt-1">
                          <RoleBadge role={currentAgency.role} showDescription />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors
                    ${item.current
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout