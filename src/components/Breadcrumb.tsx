import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, showHome = true }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {showHome && (
        <>
          <Link
            to="/"
            className="inline-flex items-center text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </>
      )}
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.current ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : item.href ? (
            <Link
              to={item.href}
              className="text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumb 