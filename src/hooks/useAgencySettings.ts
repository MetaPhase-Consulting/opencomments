import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAgency } from '../contexts/AgencyContext'

export interface AgencyProfile {
  id: string
  name: string
  jurisdiction?: string
  jurisdiction_type?: 'state' | 'county' | 'city' | 'district' | 'other'
  description?: string
  logo_url?: string
  contact_email?: string
  public_slug?: string
  created_at: string
  updated_at: string
}

export interface AgencySettings {
  id: string
  agency_id: string
  max_file_size_mb: number
  allowed_mime_types: string[]
  captcha_enabled: boolean
  auto_publish: boolean
  accent_color: string
  footer_disclaimer?: string
  created_at: string
  updated_at: string
}

export interface AgencyMember {
  id: string
  user_id: string
  email: string
  full_name?: string
  role: 'owner' | 'admin' | 'manager' | 'reviewer' | 'viewer'
  status: 'active' | 'pending' | 'deactivated'
}

export const useAgencySettings = () => {
  const { currentAgency } = useAgency()
  const [profile, setProfile] = useState<AgencyProfile | null>(null)
  const [settings, setSettings] = useState<AgencySettings | null>(null)
  const [members, setMembers] = useState<AgencyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!currentAgency) return

    setLoading(true)
    setError(null)

    try {
      // Fetch agency profile
      const { data: profileData, error: profileError } = await supabase
        .from('agencies')
        .select('*')
        .eq('id', currentAgency.id)
        .is('deleted_at', null)
        .single()

      if (profileError) {
        console.error('Error fetching agency profile:', profileError)
        setError('Failed to load agency profile')
        return
      }

      setProfile(profileData)

      // Fetch agency settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('agency_id', currentAgency.id)
        .is('deleted_at', null)
        .single()

      if (settingsError) {
        console.error('Error fetching agency settings:', settingsError)
        setError('Failed to load agency settings')
        return
      }

      setSettings(settingsData)

      // Fetch agency members for ownership transfer
      const { data: membersData, error: membersError } = await supabase
        .from('agency_members')
        .select(`
          id,
          user_id,
          role,
          status,
          profiles!inner (
            email,
            full_name
          )
        `)
        .eq('agency_id', currentAgency.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('role', { ascending: true })

      if (membersError) {
        console.error('Error fetching agency members:', membersError)
      } else {
        const transformedMembers: AgencyMember[] = membersData?.map(member => ({
          id: member.id,
          user_id: member.user_id,
          email: member.profiles.email,
          full_name: member.profiles.full_name,
          role: member.role,
          status: member.status
        })) || []

        setMembers(transformedMembers)
      }
    } catch (err) {
      console.error('Error in fetchData:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<AgencyProfile>): Promise<void> => {
    if (!currentAgency) throw new Error('No agency selected')

    try {
      const { error } = await supabase
        .from('agencies')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', currentAgency.id)

      if (error) {
        console.error('Error updating agency profile:', error)
        throw new Error('Failed to update agency profile')
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error in updateProfile:', err)
      throw err
    }
  }

  const updateSettings = async (updates: Partial<AgencySettings>): Promise<void> => {
    if (!currentAgency) throw new Error('No agency selected')

    try {
      const { error } = await supabase
        .from('agency_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('agency_id', currentAgency.id)

      if (error) {
        console.error('Error updating agency settings:', error)
        throw new Error('Failed to update agency settings')
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error in updateSettings:', err)
      throw err
    }
  }

  const uploadLogo = async (file: File): Promise<string> => {
    if (!currentAgency) throw new Error('No agency selected')

    try {
      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `${currentAgency.id}/logo.${fileExtension}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('agency-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload logo')
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('agency-assets')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (err) {
      console.error('Error in uploadLogo:', err)
      throw err
    }
  }

  const transferOwnership = async (newOwnerId: string): Promise<void> => {
    if (!currentAgency) throw new Error('No agency selected')

    try {
      const { error } = await supabase.rpc('transfer_agency_ownership', {
        p_agency_id: currentAgency.id,
        p_new_owner_id: newOwnerId
      })

      if (error) {
        console.error('Error transferring ownership:', error)
        throw new Error(error.message)
      }

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error in transferOwnership:', err)
      throw err
    }
  }

  const archiveAgency = async (): Promise<void> => {
    if (!currentAgency) throw new Error('No agency selected')

    try {
      const { error } = await supabase.rpc('archive_agency', {
        p_agency_id: currentAgency.id
      })

      if (error) {
        console.error('Error archiving agency:', error)
        throw new Error(error.message)
      }

      // Agency is now archived - user will need to be redirected
    } catch (err) {
      console.error('Error in archiveAgency:', err)
      throw err
    }
  }

  // Initial load
  useEffect(() => {
    if (currentAgency) {
      fetchData()
    }
  }, [currentAgency])

  return {
    profile,
    settings,
    members,
    loading,
    error,
    updateProfile,
    updateSettings,
    uploadLogo,
    transferOwnership,
    archiveAgency,
    refresh: fetchData
  }
}