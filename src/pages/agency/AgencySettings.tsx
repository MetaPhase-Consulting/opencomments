import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAgencySettings } from '../../hooks/useAgencySettings'
import { usePermissions } from '../../hooks/usePermissions'
import { useAgency } from '../../contexts/AgencyContext'
import { PermissionGate, PermissionButton } from '../../components/PermissionGate'
import { RoleBadge } from '../../components/RoleBadge'
import { 
  Building2, 
  Upload, 
  Save, 
  AlertTriangle, 
  Crown,
  Archive,
  Mail,
  Globe,
  Settings as SettingsIcon,
  Palette,
  Shield,
  FileText,
  X,
  Check,
  ExternalLink
} from 'lucide-react'

const AgencySettings = () => {
  const navigate = useNavigate()
  const { currentAgency } = useAgency()
  const { hasPermission, userRole } = usePermissions(currentAgency?.id)
  const { 
    profile, 
    settings, 
    members, 
    loading, 
    error, 
    updateProfile, 
    updateSettings, 
    uploadLogo,
    transferOwnership,
    archiveAgency 
  } = useAgencySettings()

  // Form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    jurisdiction: '',
    jurisdiction_type: 'city' as const,
    description: '',
    contact_email: ''
  })

  const [settingsForm, setSettingsForm] = useState({
    max_file_size_mb: 10,
    allowed_mime_types: [] as string[],
    captcha_enabled: true,
    auto_publish: false,
    accent_color: '#0050D8',
    footer_disclaimer: ''
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Modals
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedNewOwner, setSelectedNewOwner] = useState('')
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [transferLoading, setTransferLoading] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)

  const canEdit = hasPermission('edit_agency_settings')
  const canTransfer = hasPermission('transfer_ownership')
  const canArchive = hasPermission('archive_agency')

  // Initialize form data when data loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        jurisdiction: profile.jurisdiction || '',
        jurisdiction_type: profile.jurisdiction_type || 'city',
        description: profile.description || '',
        contact_email: profile.contact_email || ''
      })
    }
  }, [profile])

  React.useEffect(() => {
    if (settings) {
      setSettingsForm({
        max_file_size_mb: settings.max_file_size_mb,
        allowed_mime_types: settings.allowed_mime_types,
        captcha_enabled: settings.captcha_enabled,
        auto_publish: settings.auto_publish,
        accent_color: settings.accent_color,
        footer_disclaimer: settings.footer_disclaimer || ''
      })
    }
  }, [settings])

  const mimeTypeOptions = [
    { value: 'application/pdf', label: 'PDF Documents' },
    { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word Documents (.docx)' },
    { value: 'application/msword', label: 'Word Documents (.doc)' },
    { value: 'text/plain', label: 'Text Files' },
    { value: 'image/jpeg', label: 'JPEG Images' },
    { value: 'image/png', label: 'PNG Images' },
    { value: 'image/gif', label: 'GIF Images' }
  ]

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/svg+xml', 'image/jpeg'].includes(file.type)) {
      setSaveError('Logo must be PNG, SVG, or JPEG format')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Logo file size must be less than 2MB')
      return
    }

    setLogoFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleMimeTypeToggle = (mimeType: string) => {
    setSettingsForm(prev => ({
      ...prev,
      allowed_mime_types: prev.allowed_mime_types.includes(mimeType)
        ? prev.allowed_mime_types.filter(type => type !== mimeType)
        : [...prev.allowed_mime_types, mimeType]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')

    try {
      // Upload logo if changed
      let logoUrl = profile?.logo_url
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile)
      }

      // Update profile
      await updateProfile({
        ...profileForm,
        logo_url: logoUrl
      })

      // Update settings
      await updateSettings(settingsForm)

      // Reset logo state
      setLogoFile(null)
      setLogoPreview(null)

      // Show success message
      console.log('Settings saved successfully')
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTransferOwnership = async () => {
    if (!selectedNewOwner) return

    setTransferLoading(true)
    try {
      await transferOwnership(selectedNewOwner)
      setShowTransferModal(false)
      setSelectedNewOwner('')
      // Show success message and potentially redirect
      console.log('Ownership transferred successfully')
    } catch (error: any) {
      console.error('Transfer failed:', error)
      // Show error message
    } finally {
      setTransferLoading(false)
    }
  }

  const handleArchiveAgency = async () => {
    setArchiveLoading(true)
    try {
      await archiveAgency()
      // Redirect to agency selection or home
      navigate('/agency/no-access')
    } catch (error: any) {
      console.error('Archive failed:', error)
      // Show error message
    } finally {
      setArchiveLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  // Read-only view for non-admins
  if (!canEdit) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agency Settings</h1>
          <p className="text-gray-600 mt-1">View your agency's configuration</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{profile?.name}</h2>
              <p className="text-gray-600">{profile?.jurisdiction}</p>
              {userRole && <RoleBadge role={userRole} size="sm" />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Email</h3>
              <p className="text-gray-900">{profile?.contact_email || 'Not set'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Public URL</h3>
              <p className="text-gray-900">
                {profile?.public_slug ? (
                  <a 
                    href={`https://${profile.public_slug}.opencomments.us`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-800 underline inline-flex items-center"
                  >
                    {profile.public_slug}.opencomments.us
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  'Not configured'
                )}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">File Size Limit</h3>
              <p className="text-gray-900">{settings?.max_file_size_mb} MB</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">CAPTCHA</h3>
              <p className="text-gray-900">{settings?.captcha_enabled ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                window.location.href = 'mailto:support@opencomments.us?subject=Settings Change Request'
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              <Mail className="w-4 h-4 mr-2" />
              Request Settings Change
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agency Settings</h1>
        <p className="text-gray-600 mt-1">Configure your agency profile and comment defaults</p>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm text-red-600">{saveError}</span>
          </div>
        </div>
      )}

      {/* Agency Profile Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Building2 className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Agency Profile</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agency Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {logoPreview || profile?.logo_url ? (
                  <img 
                    src={logoPreview || profile?.logo_url} 
                    alt="Agency logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, SVG, or JPEG. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agency Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City of Springfield"
              />
            </div>

            {/* Jurisdiction Type */}
            <div>
              <label htmlFor="jurisdiction_type" className="block text-sm font-medium text-gray-700 mb-1">
                Jurisdiction Type
              </label>
              <select
                id="jurisdiction_type"
                value={profileForm.jurisdiction_type}
                onChange={(e) => setProfileForm(prev => ({ ...prev, jurisdiction_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="city">City</option>
                <option value="county">County</option>
                <option value="state">State</option>
                <option value="district">District</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Jurisdiction */}
            <div>
              <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
                Jurisdiction
              </label>
              <input
                type="text"
                id="jurisdiction"
                value={profileForm.jurisdiction}
                onChange={(e) => setProfileForm(prev => ({ ...prev, jurisdiction: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Springfield, IL"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                id="contact_email"
                value={profileForm.contact_email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, contact_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="clerk@springfield.gov"
              />
            </div>
          </div>

          {/* Public Slug (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public URL
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                https://
              </span>
              <input
                type="text"
                value={profile?.public_slug || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 focus:outline-none"
              />
              <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                .opencomments.us
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Public URL is automatically generated from your agency name
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={profileForm.description}
              onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of your agency..."
            />
          </div>
        </div>
      </div>

      {/* Comment Defaults Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <SettingsIcon className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Comment Defaults</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Max File Size */}
            <div>
              <label htmlFor="max_file_size" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                id="max_file_size"
                min="1"
                max="100"
                value={settingsForm.max_file_size_mb}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, max_file_size_mb: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Accent Color */}
            <div>
              <label htmlFor="accent_color" className="block text-sm font-medium text-gray-700 mb-1">
                Accent Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="accent_color"
                  value={settingsForm.accent_color}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settingsForm.accent_color}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#0050D8"
                />
              </div>
            </div>
          </div>

          {/* Allowed File Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed File Types
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mimeTypeOptions.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settingsForm.allowed_mime_types.includes(option.value)}
                    onChange={() => handleMimeTypeToggle(option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settingsForm.captcha_enabled}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, captcha_enabled: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Require CAPTCHA verification for submissions
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settingsForm.auto_publish}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, auto_publish: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Auto-publish comments (skip moderation queue)
              </span>
            </label>
          </div>

          {/* Footer Disclaimer */}
          <div>
            <label htmlFor="footer_disclaimer" className="block text-sm font-medium text-gray-700 mb-1">
              Footer Disclaimer Text
            </label>
            <textarea
              id="footer_disclaimer"
              rows={2}
              value={settingsForm.footer_disclaimer}
              onChange={(e) => setSettingsForm(prev => ({ ...prev, footer_disclaimer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional disclaimer text for public comment pages..."
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <PermissionGate permission="transfer_ownership">
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Transfer Ownership */}
            {canTransfer && (
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Transfer Ownership</h3>
                  <p className="text-sm text-gray-600">
                    Transfer agency ownership to another team member
                  </p>
                </div>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Transfer
                </button>
              </div>
            )}

            {/* Archive Agency */}
            {canArchive && (
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Archive Agency</h3>
                  <p className="text-sm text-gray-600">
                    Permanently archive this agency and all its dockets
                  </p>
                </div>
                <button
                  onClick={() => setShowArchiveModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
      </PermissionGate>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Transfer Ownership</h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Select a team member to transfer agency ownership to. You will become an Admin after the transfer.
                </p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Owner
                </label>
                <select
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a team member...</option>
                  {members.filter(m => m.role !== 'owner').map(member => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.full_name || member.email} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferOwnership}
                  disabled={!selectedNewOwner || transferLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transferLoading ? 'Transferring...' : 'Transfer Ownership'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Archive Agency</h3>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">This action cannot be undone</h4>
                    <p className="text-sm text-gray-600">
                      Archiving will hide all dockets from public view and deactivate the agency.
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Type <strong>{profile?.name}</strong> to confirm:
                </p>
                <input
                  type="text"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={profile?.name}
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchiveAgency}
                  disabled={archiveLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {archiveLoading ? 'Archiving...' : 'Archive Agency'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgencySettings