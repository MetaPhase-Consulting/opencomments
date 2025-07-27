import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAgency } from '../contexts/AgencyContext'
import { AgencyRole } from '../types/roles'

export interface AgencyUser {
  id: string
  user_id: string
  email: string
  full_name?: string
  role: AgencyRole
  status: 'active' | 'pending' | 'deactivated'
  joined_at?: string
  invited_at?: string
  invited_by?: string
  created_at: string
  updated_at: string
}

export interface AgencyInvitation {
  id: string
  agency_id: string
  email: string
  role: AgencyRole
  invited_by: string
  invited_by_name?: string
  expires_at: string
  created_at: string
  accepted_at?: string
}

export const useAgencyUsers = () => {
  const { currentAgency } = useAgency()
  const [users, setUsers] = useState<AgencyUser[]>([])
  const [invitations, setInvitations] = useState<AgencyInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    if (!currentAgency) return

    setLoading(true)
    setError(null)

    try {
      // Fetch agency members with user profiles
      const { data: membersData, error: membersError } = await supabase
        .from('agency_members')
        .select(`
          id,
          user_id,
          role,
          status,
          joined_at,
          invited_at,
          invited_by,
          created_at,
          updated_at,
          profiles!inner (
            email,
            full_name
          )
        `)
        .eq('agency_id', currentAgency.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (membersError) {
        console.error('Error fetching agency members:', membersError)
        setError('Failed to load users')
        return
      }

      // Transform data
      const transformedUsers: AgencyUser[] = membersData?.map(member => ({
        id: member.id,
        user_id: member.user_id,
        email: member.profiles.email,
        full_name: member.profiles.full_name,
        role: member.role,
        status: member.status,
        joined_at: member.joined_at,
        invited_at: member.invited_at,
        invited_by: member.invited_by,
        created_at: member.created_at,
        updated_at: member.updated_at
      })) || []

      setUsers(transformedUsers)

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('agency_invitations')
        .select(`
          id,
          agency_id,
          email,
          role,
          invited_by,
          expires_at,
          created_at,
          accepted_at,
          profiles!invited_by (
            full_name
          )
        `)
        .eq('agency_id', currentAgency.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (invitationsError) {
        console.error('Error fetching invitations:', invitationsError)
      } else {
        const transformedInvitations: AgencyInvitation[] = invitationsData?.map(invitation => ({
          id: invitation.id,
          agency_id: invitation.agency_id,
          email: invitation.email,
          role: invitation.role,
          invited_by: invitation.invited_by,
          invited_by_name: invitation.profiles?.full_name,
          expires_at: invitation.expires_at,
          created_at: invitation.created_at,
          accepted_at: invitation.accepted_at
        })) || []

        setInvitations(transformedInvitations)
      }
    } catch (err) {
      console.error('Error in fetchUsers:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inviteUser = async (email: string, role: AgencyRole): Promise<void> => {
    if (!currentAgency) throw new Error('No agency selected')

    try {
      const { data, error } = await supabase.rpc('invite_user_to_agency', {
        p_agency_id: currentAgency.id,
        p_email: email.toLowerCase().trim(),
        p_role: role
      })

      if (error) {
        console.error('Error inviting user:', error)
        throw new Error(error.message)
      }

      // Refresh data
      await fetchUsers()
    } catch (err) {
      console.error('Error in inviteUser:', err)
      throw err
    }
  }

  const changeUserRole = async (memberId: string, newRole: AgencyRole): Promise<void> => {
    try {
      const { data, error } = await supabase.rpc('change_user_role', {
        p_member_id: memberId,
        p_new_role: newRole
      })

      if (error) {
        console.error('Error changing user role:', error)
        throw new Error(error.message)
      }

      // Refresh data
      await fetchUsers()
    } catch (err) {
      console.error('Error in changeUserRole:', err)
      throw err
    }
  }

  const changeUserStatus = async (memberId: string, status: 'active' | 'deactivated'): Promise<void> => {
    try {
      const { data, error } = await supabase.rpc('change_user_status', {
        p_member_id: memberId,
        p_status: status
      })

      if (error) {
        console.error('Error changing user status:', error)
        throw new Error(error.message)
      }

      // Refresh data
      await fetchUsers()
    } catch (err) {
      console.error('Error in changeUserStatus:', err)
      throw err
    }
  }

  const resendInvitation = async (invitationId: string): Promise<void> => {
    try {
      const { data, error } = await supabase.rpc('resend_agency_invitation', {
        p_invitation_id: invitationId
      })

      if (error) {
        console.error('Error resending invitation:', error)
        throw new Error(error.message)
      }

      // Refresh data
      await fetchUsers()
    } catch (err) {
      console.error('Error in resendInvitation:', err)
      throw err
    }
  }

  const revokeInvitation = async (invitationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('agency_invitations')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', invitationId)

      if (error) {
        console.error('Error revoking invitation:', error)
        throw new Error('Failed to revoke invitation')
      }

      // Refresh data
      await fetchUsers()
    } catch (err) {
      console.error('Error in revokeInvitation:', err)
      throw err
    }
  }

  // Initial load
  useEffect(() => {
    if (currentAgency) {
      fetchUsers()
    }
  }, [currentAgency])

  return {
    users,
    invitations,
    loading,
    error,
    inviteUser,
    changeUserRole,
    changeUserStatus,
    resendInvitation,
    revokeInvitation,
    refresh: fetchUsers
  }
}