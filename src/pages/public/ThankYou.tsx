import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/PublicLayout';
import { 
  CheckCircle, 
  MessageSquare, 
  Clock, 
  Mail,
  Share2,
  ArrowLeft,
  Copy,
  ExternalLink
} from 'lucide-react';

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('tracking');
  const [copied, setCopied] = useState(false);

  const copyTrackingId = () => {
    if (trackingId) {
      navigator.clipboard.writeText(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: 'I just submitted a public comment',
        text: 'I participated in the democratic process by submitting a public comment on OpenComments.',
        url: window.location.origin
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <PublicLayout 
      title="Comment Submitted Successfully - OpenComments"
      description="Your public comment has been submitted successfully"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Comment Submitted Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Thank you for participating in the democratic process. Your voice matters and 
            helps ensure government decisions reflect community input.
          </p>

          {/* Tracking Information */}
          {trackingId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                Your Submission Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-sm text-blue-700 mr-2">Tracking ID:</span>
                  <code className="bg-white px-3 py-1 rounded border text-blue-900 font-mono">
                    {trackingId}
                  </code>
                  <button
                    onClick={copyTrackingId}
                    className="ml-2 p-1 text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    title="Copy tracking ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-green-600">Tracking ID copied to clipboard!</p>
                )}
                <p className="text-sm text-blue-700">
                  Save this ID to reference your comment in the future
                </p>
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              What Happens Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Review Process</h3>
                  <p className="text-sm text-gray-600">
                    Your comment will be reviewed by agency staff to ensure it meets 
                    basic guidelines before being published publicly.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Public Publication</h3>
                  <p className="text-sm text-gray-600">
                    Once approved, your comment will appear on the public docket page 
                    where others can read your feedback.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Agency Consideration</h3>
                  <p className="text-sm text-gray-600">
                    All public comments are considered by the agency when making 
                    their final decision on the proposal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dockets"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Find More Comment Opportunities
              </Link>

              <button
                onClick={shareUrl}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share OpenComments
              </button>
            </div>

            <p className="text-sm text-gray-500">
              <Link 
                to="/" 
                className="text-blue-700 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Return to homepage
              </Link>
            </p>
          </div>

          {/* Additional Information */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Stay Engaged
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Create an Account</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Track your comments and get notified about new comment opportunities.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 underline"
                >
                  Sign up for free
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Follow Up</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Check back to see how your comment and others influenced the final decision.
                </p>
                <Link
                  to="/dockets"
                  className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 underline"
                >
                  Browse all dockets
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ThankYou;