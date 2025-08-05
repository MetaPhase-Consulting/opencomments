import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { BookOpen, Users, Shield, Settings, Eye, FileText, MessageSquare, Crown } from 'lucide-react';

const UserGuide = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">User/Admin Guide</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-0">
              <strong>Last Updated:</strong> January 27, 2025
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 mb-4">
              OpenComments provides government agencies with a comprehensive platform for managing public comment periods. 
              This guide explains the different user roles, their capabilities, and the workflows for effectively 
              collecting and managing public input.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <BookOpen className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-green-900">Getting Started</h3>
              </div>
              <p className="text-green-800">
                New to OpenComments? Start with the role-based permissions section to understand 
                what you can do, then review the relevant workflows for your responsibilities.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Roles & Permissions</h2>
            <p className="text-gray-700 mb-6">
              OpenComments uses a role-based permission system to ensure appropriate access to features 
              while maintaining security and accountability.
            </p>

            <div className="space-y-6">
              {/* Owner Role */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Crown className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">Owner</h3>
                    <p className="text-sm text-purple-700">Agency executive / principal contact</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-purple-900">Full Platform Access</h4>
                  <ul className="text-sm text-purple-800 space-y-1 ml-4">
                    <li>• Create, edit, and manage all comment periods (dockets)</li>
                    <li>• Approve, reject, and moderate all public comments</li>
                    <li>• Invite and manage team members with any role</li>
                    <li>• Configure agency settings and branding</li>
                    <li>• Export data and generate reports</li>
                    <li>• Transfer ownership to another team member</li>
                    <li>• Archive or delete the agency account</li>
                  </ul>
                  <p className="text-xs text-purple-700 mt-3">
                    <strong>Typical Users:</strong> Agency Director, City Manager, Department Head
                  </p>
                </div>
              </div>

              {/* Admin Role */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Settings className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Admin</h3>
                    <p className="text-sm text-red-700">IT lead or program manager</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-red-900">Administrative Control</h4>
                  <ul className="text-sm text-red-800 space-y-1 ml-4">
                    <li>• Create, edit, and manage all comment periods</li>
                    <li>• Moderate comments and manage review queue</li>
                    <li>• Invite users and manage roles (Manager level and below)</li>
                    <li>• Configure agency settings and preferences</li>
                    <li>• Export data and access analytics</li>
                    <li>• Cannot transfer ownership or delete agency</li>
                  </ul>
                  <p className="text-xs text-red-700 mt-3">
                    <strong>Typical Users:</strong> IT Manager, Communications Director, Program Manager
                  </p>
                </div>
              </div>

              {/* Manager Role */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Shield className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Manager</h3>
                    <p className="text-sm text-blue-700">Program staff who run comment periods</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-blue-900">Content Management</h4>
                  <ul className="text-sm text-blue-800 space-y-1 ml-4">
                    <li>• Create and edit their own comment periods</li>
                    <li>• Open, close, and archive their dockets</li>
                    <li>• Moderate comments on their dockets</li>
                    <li>• Export data from their comment periods</li>
                    <li>• View analytics for their dockets</li>
                    <li>• Cannot manage other users or agency settings</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-3">
                    <strong>Typical Users:</strong> Policy Analyst, Project Manager, Department Staff
                  </p>
                </div>
              </div>

              {/* Reviewer Role */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <MessageSquare className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Reviewer</h3>
                    <p className="text-sm text-green-700">Clerk or analyst who reviews submissions</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-green-900">Comment Moderation</h4>
                  <ul className="text-sm text-green-800 space-y-1 ml-4">
                    <li>• Review and moderate public comments</li>
                    <li>• Approve, reject, or flag submissions</li>
                    <li>• Export comment data for analysis</li>
                    <li>• View dashboard and basic analytics</li>
                    <li>• Cannot create or edit comment periods</li>
                    <li>• Cannot manage users or settings</li>
                  </ul>
                  <p className="text-xs text-green-700 mt-3">
                    <strong>Typical Users:</strong> Administrative Assistant, Policy Clerk, Intern
                  </p>
                </div>
              </div>

              {/* Viewer Role */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Eye className="w-8 h-8 text-gray-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Viewer</h3>
                    <p className="text-sm text-gray-700">Read-only staff, auditors</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Read-Only Access</h4>
                  <ul className="text-sm text-gray-800 space-y-1 ml-4">
                    <li>• View dashboard and agency statistics</li>
                    <li>• Browse all comment periods and submissions</li>
                    <li>• Export data for reporting purposes</li>
                    <li>• Cannot create, edit, or moderate content</li>
                    <li>• Cannot manage users or change settings</li>
                  </ul>
                  <p className="text-xs text-gray-700 mt-3">
                    <strong>Typical Users:</strong> Auditor, Legal Counsel, Executive Assistant
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Core Workflows</h2>
            
            <div className="space-y-8">
              {/* Creating a Comment Period */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Creating a Comment Period</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-blue-800 mb-4">
                    <strong>Who can do this:</strong> Owner, Admin, Manager
                  </p>
                  <ol className="text-blue-800 space-y-2">
                    <li><strong>1. Navigate to Dockets</strong> → Click "New Docket"</li>
                    <li><strong>2. Basic Information</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Enter a clear, descriptive title</li>
                        <li>• Write a comprehensive summary explaining the proposal</li>
                        <li>• Select relevant topic tags for discoverability</li>
                      </ul>
                    </li>
                    <li><strong>3. Schedule & Rules</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Set open and close dates/times</li>
                        <li>• Configure file upload limits and allowed types</li>
                        <li>• Enable CAPTCHA protection (recommended)</li>
                      </ul>
                    </li>
                    <li><strong>4. Settings & Documents</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Customize the public URL slug</li>
                        <li>• Add internal reference code if needed</li>
                        <li>• Choose moderation preference (review vs auto-publish)</li>
                        <li>• Upload supporting documents for public review</li>
                      </ul>
                    </li>
                    <li><strong>5. Review & Launch</strong> → Publish when ready for public comments</li>
                  </ol>
                </div>
              </div>

              {/* Comment Moderation */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Comment Moderation Workflow</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <p className="text-green-800 mb-4">
                    <strong>Who can do this:</strong> Owner, Admin, Manager, Reviewer
                  </p>
                  <ol className="text-green-800 space-y-2">
                    <li><strong>1. Access Moderation Queue</strong> → Navigate to Moderation → Review Queue</li>
                    <li><strong>2. Review Submissions</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Read comment content for relevance and appropriateness</li>
                        <li>• Check attached files if any</li>
                        <li>• Verify commenter information</li>
                      </ul>
                    </li>
                    <li><strong>3. Take Action</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• <strong>Approve:</strong> Comment appears publicly</li>
                        <li>• <strong>Reject:</strong> Comment is hidden (provide reason)</li>
                        <li>• <strong>Flag:</strong> Mark for supervisor review</li>
                      </ul>
                    </li>
                    <li><strong>4. Bulk Actions</strong> → Select multiple comments for efficient processing</li>
                    <li><strong>5. Monitor Activity</strong> → Track moderation history and decisions</li>
                  </ol>
                </div>
              </div>

              {/* Data Export */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Export & Reporting</h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <p className="text-purple-800 mb-4">
                    <strong>Who can do this:</strong> All roles (Viewer and above)
                  </p>
                  <ol className="text-purple-800 space-y-2">
                    <li><strong>1. Navigate to Reports</strong> → Access Reports & Exports section</li>
                    <li><strong>2. Choose Export Type</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• <strong>CSV:</strong> Spreadsheet with comment data and metadata</li>
                        <li>• <strong>ZIP:</strong> Archive of all uploaded attachments</li>
                        <li>• <strong>Combined:</strong> CSV + ZIP bundled together</li>
                      </ul>
                    </li>
                    <li><strong>3. Set Filters</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Select specific dockets or export all</li>
                        <li>• Choose comment statuses to include</li>
                        <li>• Set date ranges if needed</li>
                      </ul>
                    </li>
                    <li><strong>4. Generate Export</strong> → Large exports are processed in background</li>
                    <li><strong>5. Download Results</strong> → Receive download link when ready</li>
                  </ol>
                </div>
              </div>

              {/* User Management */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Management</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-red-800 mb-4">
                    <strong>Who can do this:</strong> Owner, Admin (limited)
                  </p>
                  <ol className="text-red-800 space-y-2">
                    <li><strong>1. Navigate to Users & Roles</strong> → Access team management</li>
                    <li><strong>2. Invite New Users</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Enter government email address</li>
                        <li>• Assign appropriate role based on responsibilities</li>
                        <li>• User receives invitation email with login instructions</li>
                      </ul>
                    </li>
                    <li><strong>3. Manage Existing Users</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Change roles as responsibilities evolve</li>
                        <li>• Deactivate users who no longer need access</li>
                        <li>• Resend invitations if needed</li>
                      </ul>
                    </li>
                    <li><strong>4. Role Limitations</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Admins can only manage Manager-level and below</li>
                        <li>• Cannot remove the last Owner from an agency</li>
                        <li>• Role changes take effect immediately</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Best Practices</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Comment Period Setup</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Allow 30+ days for meaningful public input</li>
                  <li>• Write clear, jargon-free descriptions</li>
                  <li>• Include all relevant supporting documents</li>
                  <li>• Use descriptive titles that explain the proposal</li>
                  <li>• Set reasonable file size limits (10MB recommended)</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Comment Moderation</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Review comments within 1-3 business days</li>
                  <li>• Focus on relevance, not agreement with position</li>
                  <li>• Provide clear rejection reasons when needed</li>
                  <li>• Maintain consistent moderation standards</li>
                  <li>• Document decisions for transparency</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Data Management</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Export data regularly for backup</li>
                  <li>• Follow records retention policies</li>
                  <li>• Protect personally identifiable information</li>
                  <li>• Use analytics to improve future engagement</li>
                  <li>• Archive completed comment periods</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2">Team Coordination</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Assign clear roles and responsibilities</li>
                  <li>• Train team members on platform features</li>
                  <li>• Establish moderation guidelines</li>
                  <li>• Regular check-ins during active periods</li>
                  <li>• Document agency-specific procedures</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Tasks by Role</h2>
            
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Viewer</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Create comment periods</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Moderate comments</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Invite team members</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Export data</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Configure agency settings</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Transfer ownership</td>
                      <td className="px-6 py-4 text-center text-green-600">✓</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                      <td className="px-6 py-4 text-center text-gray-300">✗</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Help</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Technical Support</h3>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Support:</strong> Available through our contact form</p>
                  <p><strong>Response Time:</strong> 1-2 business days</p>
                  <p><strong>Hours:</strong> Monday-Friday, 9 AM - 5 PM EST</p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Training & Onboarding</h3>
                <div className="space-y-2 text-green-800">
                  <p>• Live training sessions for new agencies</p>
                  <p>• Video tutorials and documentation</p>
                  <p>• Best practices workshops</p>
                  <p>• Custom training for large teams</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Troubleshooting</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Can't access certain features?</h3>
                <p className="text-sm text-gray-700">
                  Check your role permissions above. Contact your agency Owner or Admin to request 
                  higher access if needed for your responsibilities.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Comments not appearing publicly?</h3>
                <p className="text-sm text-gray-700">
                  Comments require approval before appearing publicly (unless auto-publish is enabled). 
                  Check the moderation queue and ensure comments are approved.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Export taking too long?</h3>
                <p className="text-sm text-gray-700">
                  Large exports with many attachments are processed in the background. You'll receive 
                  a download link when ready. Check the Reports page for status updates.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Need to change agency settings?</h3>
                <p className="text-sm text-gray-700">
                  Only Owners and Admins can modify agency settings. Contact them directly or 
                  reach out to support if you're the primary contact.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserGuide;