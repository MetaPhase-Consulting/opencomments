import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAgency } from '../contexts/AgencyContext'
import { usePermissions } from '../hooks/usePermissions'
import { RoleBadge } from './RoleBadge'
import { PermissionGate } from './PermissionGate'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Shield, 
  Search,
  BarChart3,
  Users, 
  Settings,
  ChevronDown,
  LogOut,
  Building2,
  Menu,
  X,
  Plus,
  Flag
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const { currentAgency } = useAgency()
  const { userRole } = usePermissions(currentAgency?.id)
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/agency/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/agency/dashboard',
      permission: 'view_dashboard' as const
    },
    {
      name: 'Dockets',
      href: '/agency/dockets',
      icon: MessageSquare,
      current: location.pathname.startsWith('/agency/dockets') || location.pathname.startsWith('/agency/threads'),
      permission: 'view_dashboard' as const,
      children: [
        {
          name: 'All Dockets',
          href: '/agency/dockets',
          current: location.pathname === '/agency/dockets' || location.pathname === '/agency/threads'
        },
        {
          name: 'New Docket',
          href: '/agency/dockets/new',
          current: location.pathname === '/agency/dockets/new' || location.pathname === '/agency/threads/new',
          permission: 'create_thread' as const
        }
      ]
    },
    {
      name: 'Moderation',
      href: '/agency/moderation',
      icon: Shield,
      current: location.pathname.startsWith('/agency/moderation'),
      permission: 'approve_comments' as const,
      children: [
        {
          name: 'Review Queue',
          href: '/agency/moderation/queue',
          current: location.pathname === '/agency/moderation/queue'
        },
        {
          name: 'Flagged Items',
          href: '/agency/moderation/flagged',
          current: location.pathname === '/agency/moderation/flagged'
        }
      ]
    },
    {
      name: 'Search',
      href: '/agency/search',
      icon: Search,
      current: location.pathname.startsWith('/agency/search'),
      permission: 'view_dashboard' as const,
      children: [
        {
          name: 'Global Search',
          href: '/agency/search',
          current: location.pathname === '/agency/search'
        }
      ]
    },
    {
      name: 'Reports & Exports',
      href: '/agency/reports',
      icon: BarChart3,
      current: location.pathname.startsWith('/agency/reports'),
      permission: 'view_dashboard' as const
    },
    {
      name: 'Users & Roles',
      href: '/agency/users',
      icon: Users,
      current: location.pathname.startsWith('/agency/users'),
      permission: 'invite_users' as const
    },
    {
      name: 'Agency Settings',
      href: '/agency/settings',
      icon: Settings,
      current: location.pathname.startsWith('/agency/settings'),
      permission: 'edit_agency_settings' as const
    }
  ]

  const { hasPermission } = usePermissions(currentAgency?.id)

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  )

  const NavigationItem = ({ item, isChild = false }: { item: any, isChild?: boolean }) => {
    const canAccess = !item.permission || hasPermission(item.permission)
    
    if (!canAccess) return null

    const baseClasses = `
      group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
      ${isChild ? 'pl-11' : ''}
    `
    
    const activeClasses = item.current
      ? 'bg-blue-100 text-blue-900'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'

    const disabledClasses = item.disabled
      ? 'opacity-50 cursor-not-allowed'
      : ''

    if (item.disabled) {
      return (
        <div 
          className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
          title={item.tooltip}
        >
          {!isChild && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
          {item.name}
        </div>
      )
    }

    return (
      <Link
        to={item.href}
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => setSidebarOpen(false)}
      >
        {!isChild && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
        {item.name}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {currentAgency?.name || 'Agency Portal'}
              </h1>
              {currentAgency?.jurisdiction && (
                <p className="text-xs text-gray-500 truncate">
                  {currentAgency.jurisdiction}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1" aria-label="Agency navigation">
          {filteredNavigation.map((item) => (
            <div key={item.name}>
              <NavigationItem item={item} />
              {item.children && (
                <div className="mt-1 space-y-1">
                  {item.children.map((child: any) => {
                    const childCanAccess = !child.permission || hasPermission(child.permission)
                    return childCanAccess ? (
                      <NavigationItem key={child.name} item={child} isChild />
                    ) : null
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-blue-700 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Desktop agency info */}
              <div className="hidden lg:flex items-center">
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

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center text-white hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 rounded-md px-3 py-2"
                >
                  <span className="text-sm font-medium mr-2">
                    {user?.email}
                  </span>
                  {currentAgency && userRole && (
                    <div className="mr-2">
                      <RoleBadge role={userRole} size="sm" />
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
                        {currentAgency && userRole && (
                          <div className="mt-1">
                            <RoleBadge role={userRole} showDescription />
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

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout