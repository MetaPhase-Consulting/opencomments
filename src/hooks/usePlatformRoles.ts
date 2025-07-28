import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { PlatformRole, PlatformRoleInfo, PlatformUser, CreateAgencyRequest, InviteUserRequest } from '../types/platform'

export const usePlatformRoles = () => {
  const { user } = useAuth()
  const [platformRole, setPlatformRole] = useState<PlatformRole | null>(null)
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlatformRole = async () => {
    if (!user) {
      setPlatformRole(null)
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('platform_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching platform role:', fetchError)
        setError('Failed to load platform role')
        return
      }

      setPlatformRole(data?.role || null)
    } catch (err) {
      console.error('Error in fetchPlatformRole:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatformUsers = async () => {
    if (!platformRole) return

    try {
      const { data, error: fetchError } = await supabase
        .from('platform_roles')
        .select(`
          user_id,
          role,
          created_at,
          profiles!inner (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching platform users:', fetchError)
        setError('Failed to load platform users')
        return
      }

      const formattedUsers: PlatformUser[] = data?.map(item => ({
        id: item.user_id,
        email: item.profiles.email,
        full_name: item.profiles.full_name,
        platform_role: item.role as PlatformRole,
        created_at: item.created_at
      })) || []

      setPlatformUsers(formattedUsers)
    } catch (err) {
      console.error('Error in fetchPlatformUsers:', err)
      setError('Failed to load platform users')
    }
  }

  const createAgency = async (request: CreateAgencyRequest): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('create_agency_with_owner', {
        p_agency_name: request.name,
        p_jurisdiction: request.jurisdiction,
        p_jurisdiction_type: request.jurisdiction_type || 'city',
        p_description: request.description,
        p_owner_email: request.owner_email,
        p_owner_name: request.owner_name
      })

      if (error) {
        console.error('Error creating agency:', error)
        throw new Error(error.message)
      }

      return data
    } catch (err) {
      console.error('Error in createAgency:', err)
      throw err
    }
  }

  const inviteUserToAgency = async (request: InviteUserRequest): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('platform_invite_user_to_agency', {
        p_agency_id: request.agency_id,
        p_email: request.email,
        p_role: request.role,
        p_full_name: request.full_name
      })

      if (error) {
        console.error('Error inviting user:', error)
        throw new Error(error.message)
      }

      return data
    } catch (err) {
      console.error('Error in inviteUserToAgency:', err)
      throw err
    }
  }

  const inviteSuperUser = async (email: string, fullName?: string): Promise<void> => {
    if (platformRole !== 'super_owner') {
      throw new Error('Only super owners can invite super users')
    }

    try {
      // First create or update the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          email: email.toLowerCase().trim(),
          full_name: fullName?.trim(),
          role: 'agency'
        }, {
          onConflict: 'email'
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        throw new Error('Failed to create user profile')
      }

      // Then assign platform role
      const { error: roleError } = await supabase
        .from('platform_roles')
        .insert({
          user_id: profile.id,
          role: 'super_user',
          created_by: user?.id,
          updated_by: user?.id
        })

      if (roleError) {
        console.error('Error assigning platform role:', roleError)
        throw new Error('Failed to assign platform role')
      }

      // Refresh platform users list
      await fetchPlatformUsers()
    } catch (err) {
      console.error('Error in inviteSuperUser:', err)
      throw err
    }
  }

  const removeSuperUser = async (userId: string): Promise<void> => {
    if (platformRole !== 'super_owner') {
      throw new Error('Only super owners can remove super users')
    }

    try {
      const { error } = await supabase
        .from('platform_roles')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Error removing super user:', error)
        throw new Error('Failed to remove super user')
      }

      // Refresh platform users list
      await fetchPlatformUsers()
    } catch (err) {
      console.error('Error in removeSuperUser:', err)
      throw err
    }
  }

  // Initial load
  useEffect(() => {
    fetchPlatformRole()
  }, [user])

  // Load platform users when role is available
  useEffect(() => {
    if (platformRole === 'super_owner') {
      fetchPlatformUsers()
    }
  }, [platformRole])

  return {
    platformRole,
    platformUsers,
    loading,
    error,
    createAgency,
    inviteUserToAgency,
    inviteSuperUser,
    removeSuperUser,
    refresh: () => Promise.all([fetchPlatformRole(), fetchPlatformUsers()])
  }
}