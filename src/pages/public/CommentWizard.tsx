import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PublicLayout from '../../components/PublicLayout';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  MessageSquare, 
  Paperclip,
  CheckCircle,
  Upload,
  X,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';

interface DocketInfo {
  id: string;
  title: string;
  status: string;
  close_at?: string;
  max_file_size_mb: number;
  allowed_file_types: string[];
  require_captcha: boolean;
  agency_name: string;
}

interface CommentForm {
  name: string;
  email: string;
  organization: string;
  content: string;
  files: File[];
  agreedToPublic: boolean;
}

const CommentWizard = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [docket, setDocket] = useState<DocketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CommentForm>({
    name: profile?.full_name || '',
    email: user?.email || '',
    organization: '',
    content: '',
    files: [],
    agreedToPublic: false
  });

  const maxSteps = 4;
  const maxCharacters = 4000;

  useEffect(() => {
    if (slug) {
      fetchDocketInfo();
    }
  }, [slug]);

  const fetchDocketInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('dockets')
        .select(`
          id,
          title,
          status,
          close_at,
          max_file_size_mb,
          allowed_file_types,
          require_captcha,
          agencies!inner (name)
        `)
        .eq('slug', slug)
        .single();

      if (fetchError || !data) {
        setError('Comment period not found');
        return;
      }

      // Check if commenting is still open
      const isOpen = data.status === 'open' && 
        (!data.close_at || new Date(data.close_at) > new Date());

      if (!isOpen) {
        setError('This comment period is no longer accepting submissions');
        return;
      }

      setDocket({
        ...data,
        agency_name: data.agencies.name
      });

    } catch (err) {
      console.error('Error fetching docket:', err);
      setError('Failed to load comment form');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CommentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > (docket?.max_file_size_mb || 10)) {
        errors.push(`${file.name}: File too large (max ${docket?.max_file_size_mb}MB)`);
        return;
      }

      // Check file type
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !(docket?.allowed_file_types || []).includes(extension)) {
        errors.push(`${file.name}: File type not allowed`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    // Check total file count
    const totalFiles = formData.files.length + validFiles.length;
    if (totalFiles > 3) {
      setError('Maximum 3 files allowed');
      return;
    }

    setError(null);
    updateFormData('files', [...formData.files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    updateFormData('files', newFiles);
  };

  const validateStep = (step: number): boolean => {
    setError(null);

    switch (step) {
      case 1:
        // Name and email are optional, but if provided should be valid
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        return true;

      case 2:
        if (!formData.content.trim()) {
          setError('Please enter your comment');
          return false;
        }
        if (formData.content.length > maxCharacters) {
          setError(`Comment must be ${maxCharacters} characters or less`);
          return false;
        }
        return true;

      case 3:
        // File validation already handled in upload
        return true;

      case 4:
        if (!formData.agreedToPublic) {
          setError('You must acknowledge that your comment will be public');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(maxSteps, prev + 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4) || !docket) return;

    setSubmitting(true);
    setError(null);

    try {
      // Submit comment via RPC
      const { data: result, error: submitError } = await supabase.rpc('submit_public_comment', {
        p_docket_slug: slug,
        p_commenter_name: formData.name.trim() || null,
        p_commenter_email: formData.email.trim() || null,
        p_commenter_organization: formData.organization.trim() || null,
        p_content: formData.content.trim(),
        p_ip_address: null, // Will be set by server if needed
        p_user_agent: navigator.userAgent
      });

      if (submitError) {
        console.error('Submit error:', submitError);
        setError('Failed to submit comment. Please try again.');
        return;
      }

      const commentId = result.comment_id;
      const trackingId = result.tracking_id;

      // Upload files if any
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const fileExtension = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExtension}`;
          const filePath = `public/docket/${docket.id}/${commentId}/${fileName}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('comment-attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            // Continue with submission even if file upload fails
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('comment-attachments')
            .getPublicUrl(filePath);

          // Save attachment record
          await supabase
            .from('public_comment_attachments')
            .insert({
              comment_id: commentId,
              filename: file.name,
              file_url: urlData.publicUrl,
              file_path: filePath,
              mime_type: file.type,
              file_size: file.size
            });
        }
      }

      // Redirect to thank you page
      navigate(`/thank-you?tracking=${trackingId}`);

    } catch (err) {
      console.error('Submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`;
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return User;
      case 2: return MessageSquare;
      case 3: return Paperclip;
      case 4: return CheckCircle;
      default: return User;
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      </PublicLayout>
    );
  }

  if (error && !docket) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Unable to Submit Comment
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout 
      title={`Submit Comment - ${docket?.title} - OpenComments`}
      description="Submit your public comment on this government proposal"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Docket
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Public Comment</h1>
          <p className="text-gray-600">
            <strong>{docket?.title}</strong> • {docket?.agency_name}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: maxSteps }, (_, i) => {
              const step = i + 1;
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;
              const IconComponent = getStepIcon(step);

              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isActive 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : isCompleted 
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                    }
                  `}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {step < maxSteps && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Your Details</span>
            <span className="text-xs text-gray-600">Your Comment</span>
            <span className="text-xs text-gray-600">Attachments</span>
            <span className="text-xs text-gray-600">Review & Submit</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Step 1: Your Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h2>
                <p className="text-gray-600 mb-6">
                  Help us identify your comment in the public record. All fields are optional, 
                  but providing your name helps give weight to your feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional, but recommended for public record
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional, for confirmation email only (not public)
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization or Affiliation
                </label>
                <input
                  type="text"
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => updateFormData('organization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company, organization, or group you represent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional, helps identify your perspective
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Your Comment */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Comment</h2>
                <p className="text-gray-600 mb-6">
                  Share your thoughts, concerns, or support for this proposal. Be specific 
                  and provide evidence or examples when possible.
                </p>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => updateFormData('content', e.target.value)}
                  rows={12}
                  maxLength={maxCharacters}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your detailed comment here..."
                  required
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Be specific and provide evidence to support your position
                  </p>
                  <p className={`text-xs ${
                    formData.content.length > maxCharacters * 0.9 
                      ? 'text-red-600' 
                      : 'text-gray-500'
                  }`}>
                    {formData.content.length}/{maxCharacters} characters
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">Writing Tips</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Reference specific sections or pages of the proposal</li>
                  <li>• Explain how the proposal would affect you personally</li>
                  <li>• Provide data, research, or expert knowledge if available</li>
                  <li>• Suggest specific alternatives or improvements</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Attachments */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Supporting Documents</h2>
                <p className="text-gray-600 mb-6">
                  Upload relevant documents, photos, or research to support your comment. 
                  All attachments will be part of the public record.
                </p>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <input
                  type="file"
                  multiple
                  accept={docket?.allowed_file_types.map(type => `.${type}`).join(',')}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Select Files
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum {docket?.max_file_size_mb}MB per file • 
                  Allowed types: {docket?.allowed_file_types.join(', ').toUpperCase()} • 
                  Up to 3 files total
                </p>
              </div>

              {/* Uploaded Files */}
              {formData.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Uploaded Files ({formData.files.length}/3)
                  </h3>
                  <div className="space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Your Comment</h2>
                <p className="text-gray-600 mb-6">
                  Please review your comment before submitting. Once submitted, 
                  you cannot edit your comment.
                </p>
              </div>

              {/* Review Summary */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Commenter Information</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Name:</strong> {formData.name || 'Anonymous'}</p>
                    <p><strong>Email:</strong> {formData.email || 'Not provided'}</p>
                    {formData.organization && (
                      <p><strong>Organization:</strong> {formData.organization}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Your Comment</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {formData.content}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.content.length} characters
                  </p>
                </div>

                {formData.files.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Attachments ({formData.files.length})
                    </h3>
                    <div className="space-y-1">
                      {formData.files.map((file, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          📎 {file.name} ({formatFileSize(file.size)})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Public Record Agreement */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.agreedToPublic}
                    onChange={(e) => updateFormData('agreedToPublic', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                    required
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-yellow-800">
                      I understand that my comment will become part of the public record
                    </span>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your comment and any attachments will be visible to the public. 
                      Your email address will remain private.
                    </p>
                  </div>
                </label>
              </div>

              {/* CAPTCHA Placeholder */}
              {docket?.require_captcha && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">CAPTCHA verification required</p>
                  <div className="w-64 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
                    <span className="text-gray-500 text-sm">CAPTCHA placeholder</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>

              {currentStep < maxSteps ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.agreedToPublic}
                  className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Comment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CommentWizard;