import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

export interface AgencyInfo {
  id: string
  name: string
  jurisdiction?: string
  role: 'owner' | 'admin' | 'manager' | 'reviewer' | 'viewer'
}

interface AgencyContextType {
  currentAgency: AgencyInfo | null
  availableAgencies: AgencyInfo[]
  setCurrentAgency: (agency: AgencyInfo | null) => void
  loading: boolean
  hasAgencyAccess: boolean
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined)

export const useAgency = () => {
  const context = useContext(AgencyContext)
  if (context === undefined) {
    throw new Error('useAgency must be used within an AgencyProvider')
  }
  return context
}

const STORAGE_KEY = 'opencomments_current_agency'

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading: authLoading } = useAuth()
  const [currentAgency, setCurrentAgencyState] = useState<AgencyInfo | null>(null)
  const [availableAgencies, setAvailableAgencies] = useState<AgencyInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Load persisted agency from localStorage
  useEffect(() => {
    if (!authLoading && user) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setCurrentAgencyState(parsed)
        } catch (error) {
          console.error('Failed to parse stored agency:', error)
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    }
  }, [user, authLoading])

  // Fetch user's agencies when authenticated
  useEffect(() => {
    const fetchAgencies = async () => {
      if (!user || !profile) {
        setAvailableAgencies([])
        setLoading(false)
        return
      }

      try {
        // TODO: Replace with actual agency membership query
        // For now, simulate based on existing profile data
        const mockAgencies: AgencyInfo[] = []
        
        if (profile.role === 'agency' && profile.agency_name) {
          mockAgencies.push({
            id: user.id, // Using user ID as agency ID for now
            name: profile.agency_name,
            jurisdiction: 'Local Government', // Mock jurisdiction
            role: 'admin' // Default to admin for existing agency users
          })
        }

        setAvailableAgencies(mockAgencies)
        
        // Auto-select if only one agency
        if (mockAgencies.length === 1 && !currentAgency) {
          setCurrentAgency(mockAgencies[0])
        }
        
      } catch (error) {
        console.error('Error fetching agencies:', error)
        setAvailableAgencies([])
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchAgencies()
    }
  }, [user, profile, authLoading, currentAgency])

  const setCurrentAgency = (agency: AgencyInfo | null) => {
    setCurrentAgencyState(agency)
    
    if (agency) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(agency))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Clear agency context on sign out
  useEffect(() => {
    if (!user) {
      setCurrentAgency(null)
      setAvailableAgencies([])
    }
  }, [user])

  const hasAgencyAccess = availableAgencies.length > 0

  const value = {
    currentAgency,
    availableAgencies,
    setCurrentAgency,
    loading: loading || authLoading,
    hasAgencyAccess
  }

  return <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>
}