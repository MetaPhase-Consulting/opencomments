import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDocketDetail } from '../../hooks/usePublicBrowse';
import { useAuth } from '../../contexts/AuthContext';
import PublicLayout from '../../components/PublicLayout';
import Breadcrumb from '../../components/Breadcrumb';
import { 
  Calendar, 
  MessageSquare, 
  Clock, 
  FileText,
  Download,
  Share2,
  ChevronLeft,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  User,
  Building2
} from 'lucide-react';

const DocketDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { docket, loading, error, fetchDocket } = useDocketDetail();
  const [activeTab, setActiveTab] = useState<'overview' | 'comments'>('overview');
  const [commentsPage, setCommentsPage] = useState(1);
  const [displayedComments, setDisplayedComments] = useState(10);

  useEffect(() => {
    if (slug) {
      fetchDocket(slug);
    }
  }, [slug, fetchDocket]);

  useEffect(() => {
    // Check if URL has #comments hash and switch to comments tab
    if (window.location.hash === '#comments') {
      setActiveTab('comments');
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStateAbbreviation = (stateName: string) => {
    const stateAbbreviations: Record<string, string> = {
      'Alabama': 'al',
      'Alaska': 'ak',
      'Arizona': 'az',
      'Arkansas': 'ar',
      'California': 'ca',
      'Colorado': 'co',
      'Connecticut': 'ct',
      'Delaware': 'de',
      'Florida': 'fl',
      'Georgia': 'ga',
      'Hawaii': 'hi',
      'Idaho': 'id',
      'Illinois': 'il',
      'Indiana': 'in',
      'Iowa': 'ia',
      'Kansas': 'ks',
      'Kentucky': 'ky',
      'Louisiana': 'la',
      'Maine': 'me',
      'Maryland': 'md',
      'Massachusetts': 'ma',
      'Michigan': 'mi',
      'Minnesota': 'mn',
      'Mississippi': 'ms',
      'Missouri': 'mo',
      'Montana': 'mt',
      'Nebraska': 'ne',
      'Nevada': 'nv',
      'New Hampshire': 'nh',
      'New Jersey': 'nj',
      'New Mexico': 'nm',
      'New York': 'ny',
      'North Carolina': 'nc',
      'North Dakota': 'nd',
      'Ohio': 'oh',
      'Oklahoma': 'ok',
      'Oregon': 'or',
      'Pennsylvania': 'pa',
      'Rhode Island': 'ri',
      'South Carolina': 'sc',
      'South Dakota': 'sd',
      'Tennessee': 'tn',
      'Texas': 'tx',
      'Utah': 'ut',
      'Vermont': 'vt',
      'Virginia': 'va',
      'Washington': 'wa',
      'West Virginia': 'wv',
      'Wisconsin': 'wi',
      'Wyoming': 'wy',
      'District of Columbia': 'dc'
    }
    return stateAbbreviations[stateName] || stateName.toLowerCase().replace(/\s+/g, '-')
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(bytes / 1024)}KB` : `${mb.toFixed(1)}MB`;
  };

  const getDaysRemaining = () => {
    if (!docket?.close_at) return null;
    const now = new Date();
    const close = new Date(docket.close_at);
    const diffTime = close.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isCommentingOpen = () => {
    if (!docket) return false;
    if (docket.status !== 'open') return false;
    if (!docket.close_at) return true;
    return new Date(docket.close_at) > new Date();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Show toast notification
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const sharePage = async () => {
    const url = window.location.href;
    const title = docket?.title || 'Docket Details';
    
    if (navigator.share) {
      // Mobile - use native share
      try {
        await navigator.share({
          title: title,
          url: url
        });
      } catch (err) {
        // User cancelled or error - fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      // Desktop - copy to clipboard
      copyToClipboard(url);
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

  if (error || !docket) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Docket Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              The comment period you're looking for could not be found or may have been removed.
            </p>
            <Link
              to="/dockets"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Browse All Comment Opportunities
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const daysRemaining = getDaysRemaining();
  const commentingOpen = isCommentingOpen();

  const visibleComments = docket?.comments.slice(0, displayedComments) || [];
  const hasMoreComments = docket && docket.comments.length > displayedComments;

  const loadMoreComments = () => {
    setDisplayedComments(prev => prev + 10);
  };

  const getCommentUrl = () => {
    if (!user) {
      return `/login?next=/dockets/${docket?.slug}/comment`;
    }
    return `/dockets/${docket?.slug}/comment`;
  };

  return (
    <PublicLayout 
      title={`${docket.title} - OpenComments`}
      description={docket.summary || docket.description}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: docket.agency_jurisdiction || 'State', href: docket.agency_jurisdiction ? `/state/${getStateAbbreviation(docket.agency_jurisdiction)}` : undefined },
            { label: docket.agency_name, href: `/agencies/${docket.agency_slug}` },
            { label: docket.title, current: true }
          ]}
        />

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 mb-6 lg:mb-0 lg:mr-8">
              <div className="flex items-center mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-4 ${
                  commentingOpen 
                    ? daysRemaining && daysRemaining <= 7 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {commentingOpen 
                    ? daysRemaining === null 
                      ? 'Open' 
                      : daysRemaining <= 0 
                        ? 'Closing Soon' 
                        : `${daysRemaining} Days Left`
                    : 'Closed'}
                </span>
                <Link
                  to={`/agencies/${docket.agency_slug}`}
                  className="text-sm text-gray-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {docket.agency_name}
                </Link>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {docket.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Opened {formatDate(docket.open_at)}
                </div>
                {docket.close_at && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Closes {formatDate(docket.close_at)}
                  </div>
                )}
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <button 
                    onClick={() => setActiveTab('comments')}
                    className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    {docket.comment_count} public comments
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 lg:w-64">
              {commentingOpen ? (
                <Link
                  to={getCommentUrl()}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Submit Comment
                </Link>
              ) : (
                <div className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed">
                  <Clock className="w-5 h-5 mr-2" />
                  Comment Period Closed
                </div>
              )}

              <button
                onClick={sharePage}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share This Page
              </button>
            </div>
          </div>

          {/* Status Banner */}
          {docket.status === 'archived' && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  This comment period has been archived and is no longer accepting submissions.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Overview & Documents
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'comments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Public Comments ({docket.comment_count})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                  <div className="prose max-w-none text-gray-700">
                    {docket.description ? (
                      docket.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                      ))
                    ) : (
                      <p className="text-gray-500">No description provided.</p>
                    )}
                  </div>
                </div>

                {/* Supporting Documents */}
                {docket.attachments.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Supporting Documents</h2>
                    <div className="space-y-3">
                      {docket.attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <FileText className="w-6 h-6 text-gray-400 mr-3" />
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{attachment.filename}</h3>
                              <p className="text-xs text-gray-600">
                                {formatFileSize(attachment.file_size)} • {attachment.mime_type}
                              </p>
                            </div>
                          </div>
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Public Comments ({docket.comment_count})
                  </h2>
                  {commentingOpen && (
                    <Link
                      to={getCommentUrl()}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Your Comment
                    </Link>
                  )}
                </div>

                {docket.comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No public comments yet</h3>
                    <p className="text-gray-600 mb-6">
                      Be the first to share your thoughts on this proposal.
                    </p>
                    {commentingOpen && (
                      <Link
                        to={getCommentUrl()}
                        className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        Submit First Comment
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {visibleComments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {comment.commenter_name || 'Anonymous Commenter'}
                              </h3>
                              {comment.commenter_organization && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {comment.commenter_organization}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {formatDate(comment.created_at)}
                            </p>
                            {comment.attachment_count > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                📎 {comment.attachment_count} attachment{comment.attachment_count !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-700">
                          <p className="mb-3 line-clamp-4">{comment.content}</p>
                          <Link
                            to={`/comments/${comment.id}`}
                            className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                          >
                            View Full Comment
                          </Link>
                        </div>
                      </div>
                    ))}

                    {/* Load More Comments */}
                    {hasMoreComments && (
                      <div className="text-center">
                        <button
                          onClick={loadMoreComments}
                          className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Load More Comments
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        {commentingOpen && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Your Voice Matters
            </h2>
            <p className="text-blue-800 mb-4">
              Share your thoughts and help shape this proposal. Public comments are an important part of the democratic process.
            </p>
            <Link
              to={getCommentUrl()}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Submit Your Comment
            </Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default DocketDetail;