import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SecurityBanner from '../components/SecurityBanner';
import { HelpCircle, ChevronDown, ChevronRight, Users, Building2, MessageSquare, Shield, Settings, FileText, Clock } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  questions: FAQItem[];
}

const FAQs = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const governmentSections: FAQSection[] = [
    {
      id: 'getting-started-gov',
      title: 'Getting Started',
      icon: Building2,
      description: 'Initial setup and onboarding for government agencies',
      questions: [
        {
          id: 'gov-1',
          question: 'How do I get my agency set up on OpenComments?',
          answer: 'Contact us through our onboarding form or email support@opencomments.us with your agency information. We\'ll verify your government status and set up your agency portal within 1-2 business days. The service is free for eligible government agencies.'
        },
        {
          id: 'gov-2',
          question: 'What types of agencies can use OpenComments?',
          answer: 'State agencies, local governments (cities, counties, towns), school districts, special districts (water, transit, etc.), and regional planning organizations are all eligible. We verify government status through official email domains and public records.'
        },
        {
          id: 'gov-3',
          question: 'How long does setup take?',
          answer: 'Most agencies are up and running within one week. Simple setups can be completed in 1-2 business days, while complex customizations or large team onboarding may take additional time.'
        },
        {
          id: 'gov-4',
          question: 'Do you provide training for our staff?',
          answer: 'Yes! We provide live training sessions, video tutorials, and comprehensive documentation. Training covers platform features, best practices for public engagement, and role-specific workflows.'
        },
        {
          id: 'gov-5',
          question: 'Can we customize the platform for our agency?',
          answer: 'Yes, we can customize colors, logos, and certain interface elements to match your agency\'s branding while maintaining accessibility standards. Custom domains and advanced integrations are also available.'
        }
      ]
    },
    {
      id: 'users-roles-gov',
      title: 'Users & Roles',
      icon: Users,
      description: 'Managing team members and permissions',
      questions: [
        {
          id: 'gov-6',
          question: 'What are the different user roles?',
          answer: 'OpenComments has 5 roles: Owner (full control), Admin (manage users and settings), Manager (create and manage dockets), Reviewer (moderate comments), and Viewer (read-only access). Each role has specific permissions designed for different responsibilities.'
        },
        {
          id: 'gov-7',
          question: 'How do I invite team members?',
          answer: 'Owners and Admins can invite users through the Users & Roles section. Enter their government email address, assign an appropriate role, and they\'ll receive an invitation email with login instructions.'
        },
        {
          id: 'gov-8',
          question: 'Can I change someone\'s role later?',
          answer: 'Yes, Owners can change any role, and Admins can manage Manager-level roles and below. Role changes take effect immediately. You cannot remove the last Owner from an agency.'
        },
        {
          id: 'gov-9',
          question: 'What if someone leaves our agency?',
          answer: 'Deactivate their account through the Users & Roles section. This immediately revokes access while preserving their activity history for audit purposes. You can also transfer ownership if needed.'
        },
        {
          id: 'gov-10',
          question: 'How many users can we have?',
          answer: 'There\'s no limit on the number of team members you can invite. Add as many staff as needed for your comment periods and moderation workflows.'
        }
      ]
    },
    {
      id: 'dockets-gov',
      title: 'Creating Comment Periods',
      icon: FileText,
      description: 'Setting up and managing public comment windows',
      questions: [
        {
          id: 'gov-11',
          question: 'How do I create a new comment period?',
          answer: 'Navigate to Dockets → New Docket. The wizard guides you through basic information, schedule settings, file upload rules, and publication options. You can save drafts and publish when ready.'
        },
        {
          id: 'gov-12',
          question: 'How long should comment periods be open?',
          answer: 'We recommend at least 30 days for meaningful public input. Some regulations require specific timeframes. Consider holidays, local events, and the complexity of your proposal when setting dates.'
        },
        {
          id: 'gov-13',
          question: 'Can I extend a comment period?',
          answer: 'Yes, you can extend the closing date while the period is still open. This is common when there\'s significant public interest or requests for more time. Changes are reflected immediately on the public page.'
        },
        {
          id: 'gov-14',
          question: 'What file types can the public upload?',
          answer: 'You can configure allowed file types (PDF, Word, images, etc.) and size limits per docket. We recommend allowing PDFs and common image formats, with a 10MB limit per file to balance accessibility and storage.'
        },
        {
          id: 'gov-15',
          question: 'Can I require people to identify themselves?',
          answer: 'Names and organizations are optional fields, but we recommend encouraging identification as it adds credibility to comments. Email addresses are collected but kept private. You cannot require specific identification beyond what\'s legally mandated.'
        }
      ]
    },
    {
      id: 'moderation-gov',
      title: 'Comment Moderation',
      icon: Shield,
      description: 'Reviewing and managing public submissions',
      questions: [
        {
          id: 'gov-16',
          question: 'Do all comments need to be reviewed?',
          answer: 'By default, yes. Comments are held for review before appearing publicly. You can enable auto-publishing for immediate publication, but manual review is recommended to ensure quality and relevance.'
        },
        {
          id: 'gov-17',
          question: 'What criteria should I use for approving comments?',
          answer: 'Focus on relevance to the proposal, not agreement with the position. Reject comments that are off-topic, contain personal attacks, include inappropriate content, or violate your comment guidelines. Provide clear rejection reasons.'
        },
        {
          id: 'gov-18',
          question: 'How quickly should we review comments?',
          answer: 'Aim for 1-3 business days to maintain public engagement. Faster review during active periods shows responsiveness. Set expectations on your docket pages about review timeframes.'
        },
        {
          id: 'gov-19',
          question: 'Can we edit comments before publishing?',
          answer: 'No, you cannot edit comment content. You can only approve, reject, or flag comments. If a comment has minor issues, contact the commenter directly or provide guidance in your response document.'
        },
        {
          id: 'gov-20',
          question: 'What if we receive inappropriate comments?',
          answer: 'Reject inappropriate comments and document the reason. For serious issues (threats, harassment), flag the comment and consider reporting to appropriate authorities. The platform logs all moderation actions for accountability.'
        }
      ]
    },
    {
      id: 'data-export-gov',
      title: 'Data & Reporting',
      icon: MessageSquare,
      description: 'Exporting comments and generating reports',
      questions: [
        {
          id: 'gov-21',
          question: 'How do I export comment data?',
          answer: 'Go to Reports & Exports → New Export. Choose CSV for spreadsheet data, ZIP for attachments, or Combined for both. You can filter by date range, status, or specific dockets.'
        },
        {
          id: 'gov-22',
          question: 'What data is included in exports?',
          answer: 'CSV exports include comment text, commenter information, submission dates, status, and metadata. ZIP exports contain all uploaded files organized by docket and comment. Personal email addresses are included for agency use only.'
        },
        {
          id: 'gov-23',
          question: 'How long are exports available?',
          answer: 'Export files are available for download for 24 hours after generation. Large exports are processed in the background and you\'ll receive a notification when ready.'
        },
        {
          id: 'gov-24',
          question: 'Can I get analytics on participation?',
          answer: 'Yes, the Reports section shows participation metrics, comment trends, geographic data (if available), and engagement statistics. This helps evaluate the effectiveness of your outreach efforts.'
        },
        {
          id: 'gov-25',
          question: 'What about records retention requirements?',
          answer: 'Export your data regularly to comply with your agency\'s records retention policies. OpenComments maintains data according to our terms, but you\'re responsible for long-term archival per your legal requirements.'
        }
      ]
    },
    {
      id: 'technical-gov',
      title: 'Technical & Security',
      icon: Settings,
      description: 'Platform security, integrations, and technical questions',
      questions: [
        {
          id: 'gov-26',
          question: 'Is OpenComments secure for government use?',
          answer: 'Yes, we use enterprise-grade security including HTTPS encryption, SOC 2 compliance, regular security audits, and government-standard data protection. All data is encrypted at rest and in transit.'
        },
        {
          id: 'gov-27',
          question: 'Where is our data stored?',
          answer: 'Data is stored in secure, SOC 2 compliant data centers in the United States. We use industry-leading cloud infrastructure with automatic backups and disaster recovery capabilities.'
        },
        {
          id: 'gov-28',
          question: 'Can we integrate with our existing systems?',
          answer: 'We offer API access for data integration and can work with your IT team on custom integrations. Common integrations include website embedding, single sign-on (SSO), and data feeds to existing systems.'
        },
        {
          id: 'gov-29',
          question: 'What if we need to migrate away from OpenComments?',
          answer: 'You can export all your data at any time in standard formats. There\'s no vendor lock-in - you maintain full ownership of your comment data and can migrate to other systems if needed.'
        },
        {
          id: 'gov-30',
          question: 'Do you provide uptime guarantees?',
          answer: 'We maintain 99.9% uptime with 24/7 monitoring and rapid response to any issues. Status updates are available at status.opencomments.us, and we notify agencies of any planned maintenance.'
        }
      ]
    }
  ];

  const citizenSections: FAQSection[] = [
    {
      id: 'getting-started-citizen',
      title: 'Getting Started',
      icon: Users,
      description: 'How to find and participate in public comment opportunities',
      questions: [
        {
          id: 'citizen-1',
          question: 'Do I need to create an account to submit comments?',
          answer: 'Yes, all comments require authentication to ensure integrity and prevent spam. You can sign up with email/password or use GitHub/Google OAuth. Account creation is free and takes less than a minute.'
        },
        {
          id: 'citizen-2',
          question: 'How do I find comment opportunities in my area?',
          answer: 'Use the state map on the homepage, browse by location, or search by keywords. You can also bookmark your local government\'s portal (e.g., yourtown.opencomments.us) for direct access to their comment periods.'
        },
        {
          id: 'citizen-3',
          question: 'What types of issues can I comment on?',
          answer: 'Government agencies use OpenComments for various proposals: budget reviews, zoning changes, transportation projects, environmental assessments, policy updates, and more. Each docket explains the specific issue and what feedback is sought.'
        },
        {
          id: 'citizen-4',
          question: 'Is there a cost to participate?',
          answer: 'No, OpenComments is completely free for public use. There are no fees, subscriptions, or hidden costs for citizens to participate in the democratic process.'
        },
        {
          id: 'citizen-5',
          question: 'Can I comment on behalf of an organization?',
          answer: 'Yes, you can specify that you\'re representing an organization and provide the organization name. You\'ll need to certify that you\'re authorized to speak for the organization.'
        }
      ]
    },
    {
      id: 'submitting-comments',
      title: 'Submitting Comments',
      icon: MessageSquare,
      description: 'The comment submission process and requirements',
      questions: [
        {
          id: 'citizen-6',
          question: 'What makes an effective public comment?',
          answer: 'Be specific about which aspects you support or oppose, provide factual information and evidence, explain how the proposal affects you personally, suggest specific alternatives if you have concerns, and keep comments respectful and focused on the issue.'
        },
        {
          id: 'citizen-7',
          question: 'How long can my comment be?',
          answer: 'Comment length limits vary by agency and docket, typically 2,000-4,000 characters. The form shows your character count as you type. Focus on your most important points if you\'re approaching the limit.'
        },
        {
          id: 'citizen-8',
          question: 'Can I attach files to my comment?',
          answer: 'Many dockets allow file attachments like PDFs, images, or documents. Check the docket\'s file upload rules for allowed types and size limits. Attachments become part of the public record.'
        },
        {
          id: 'citizen-9',
          question: 'Can I submit multiple comments on the same issue?',
          answer: 'Most agencies allow multiple comments per person (typically up to 3), but each should address different aspects or provide new information. Avoid submitting duplicate or very similar comments.'
        },
        {
          id: 'citizen-10',
          question: 'What is the perjury certification requirement?',
          answer: 'You must certify under penalty of perjury that your information is accurate and you\'re authorized to submit the comment. This legal requirement ensures the integrity of the public comment process and prevents fraudulent submissions.'
        }
      ]
    },
    {
      id: 'after-submission',
      title: 'After Submission',
      icon: Clock,
      description: 'What happens to your comment after you submit it',
      questions: [
        {
          id: 'citizen-11',
          question: 'When will my comment appear publicly?',
          answer: 'Most agencies review comments before publishing, which typically takes 1-3 business days. You\'ll see your comment status in your dashboard. Some agencies auto-publish comments immediately.'
        },
        {
          id: 'citizen-12',
          question: 'Will I get a response to my specific comment?',
          answer: 'Agencies rarely respond to individual comments, but they often publish summary response documents addressing common themes and concerns raised across all comments. Check the docket page for agency responses.'
        },
        {
          id: 'citizen-13',
          question: 'How are public comments used in decision-making?',
          answer: 'Agencies are required to consider all public comments when making decisions. Comments help identify issues, gauge public sentiment, and improve proposals. The final decision document often references how public input influenced the outcome.'
        },
        {
          id: 'citizen-14',
          question: 'Can I edit my comment after submitting?',
          answer: 'No, comments cannot be edited after submission to maintain the integrity of the public record. If you need to make corrections, contact the agency directly or submit an additional comment with clarifications.'
        },
        {
          id: 'citizen-15',
          question: 'What if my comment is rejected?',
          answer: 'Agencies will provide a reason for rejection. Common reasons include off-topic content, inappropriate language, or technical issues. You can revise and resubmit if the comment period is still open.'
        }
      ]
    },
    {
      id: 'privacy-security',
      title: 'Privacy & Security',
      icon: Shield,
      description: 'How your information is protected and used',
      questions: [
        {
          id: 'citizen-16',
          question: 'What information becomes public?',
          answer: 'Your name (if provided), comment text, organization affiliation, and any attachments become part of the public record. Your email address, IP address, and other personal details remain private.'
        },
        {
          id: 'citizen-17',
          question: 'Can I submit anonymous comments?',
          answer: 'You can leave the name field blank, but you still need an account for authentication. While your email won\'t be public, truly anonymous comments aren\'t possible due to security and integrity requirements.'
        },
        {
          id: 'citizen-18',
          question: 'How is my personal information protected?',
          answer: 'We use industry-standard security including HTTPS encryption, secure authentication, and SOC 2 compliant infrastructure. Email addresses are never shared or sold, and we follow strict privacy policies.'
        },
        {
          id: 'citizen-19',
          question: 'Can I delete my account and comments?',
          answer: 'You can delete your account, but published comments remain part of the public record as required by law. Unpublished comments can be removed. Contact support for account deletion requests.'
        },
        {
          id: 'citizen-20',
          question: 'Who can see my email address?',
          answer: 'Only agency staff can see your email address for verification and communication purposes. It\'s never displayed publicly or shared with other commenters. We may use it to send important updates about your comments.'
        }
      ]
    },
    {
      id: 'technical-citizen',
      title: 'Technical Support',
      icon: Settings,
      description: 'Account issues, technical problems, and platform questions',
      questions: [
        {
          id: 'citizen-21',
          question: 'I\'m having trouble logging in. What should I do?',
          answer: 'Try the "Forgot Password" link if using email/password. For OAuth accounts (GitHub/Google), ensure you\'re using the same email address. Clear your browser cache or try a different browser if problems persist.'
        },
        {
          id: 'citizen-22',
          question: 'Why can\'t I upload my file?',
          answer: 'Check that your file meets the size limit (usually 10MB) and is an allowed type (PDF, Word, images). Some dockets don\'t allow file uploads. Try a smaller file or different format if needed.'
        },
        {
          id: 'citizen-23',
          question: 'The comment period shows as closed, but I want to submit feedback.',
          answer: 'Contact the agency directly - they may still accept late comments or have other ways to provide input. Some agencies extend deadlines if there\'s significant interest.'
        },
        {
          id: 'citizen-24',
          question: 'Can I use OpenComments on my mobile device?',
          answer: 'Yes, OpenComments is fully responsive and works on smartphones and tablets. The interface adapts to your screen size for easy reading and commenting on any device.'
        },
        {
          id: 'citizen-25',
          question: 'Is OpenComments accessible for users with disabilities?',
          answer: 'Yes, we follow WCAG 2.1 AA accessibility standards with screen reader support, keyboard navigation, and high contrast options. Contact us if you need alternative formats or assistance.'
        }
      ]
    }
  ];

  const allSections = [...governmentSections, ...citizenSections];

  return (
    <div className="min-h-screen bg-white font-sans">
      <SecurityBanner />
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using OpenComments for public participation and government transparency.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-50 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Navigation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Government Agencies */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-red-600" />
                For Government Agencies
              </h3>
              <ul className="space-y-2">
                {governmentSections.map(section => {
                  const IconComponent = section.icon;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => {
                          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                          setOpenSections(prev => ({ ...prev, [section.id]: true }));
                        }}
                        className="flex items-center text-left w-full p-2 rounded hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <IconComponent className="w-4 h-4 mr-2 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{section.title}</div>
                          <div className="text-xs text-gray-600">{section.questions.length} questions</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Citizens */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                For Citizens
              </h3>
              <ul className="space-y-2">
                {citizenSections.map(section => {
                  const IconComponent = section.icon;
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => {
                          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                          setOpenSections(prev => ({ ...prev, [section.id]: true }));
                        }}
                        className="flex items-center text-left w-full p-2 rounded hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <IconComponent className="w-4 h-4 mr-2 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{section.title}</div>
                          <div className="text-xs text-gray-600">{section.questions.length} questions</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {/* Government Agencies */}
          <div>
            <div className="flex items-center mb-6">
              <Building2 className="w-6 h-6 mr-3 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">For Government Agencies</h2>
            </div>
            
            <div className="space-y-4">
              {governmentSections.map(section => {
                const IconComponent = section.icon;
                const isOpen = openSections[section.id];
                
                return (
                  <div key={section.id} id={section.id} className="bg-white border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                    >
                      <div className="flex items-center">
                        <IconComponent className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{section.questions.length} questions</span>
                        {isOpen ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="border-t border-gray-200">
                        {section.questions.map((faq, index) => {
                          const isQuestionOpen = openQuestions[faq.id];
                          
                          return (
                            <div key={faq.id} className={`${index !== section.questions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                              <button
                                onClick={() => toggleQuestion(faq.id)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                              >
                                <h4 className="text-sm font-medium text-gray-900 pr-4">{faq.question}</h4>
                                {isQuestionOpen ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                              </button>
                              
                              {isQuestionOpen && (
                                <div className="px-6 pb-4">
                                  <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Citizens */}
          <div>
            <div className="flex items-center mb-6">
              <Users className="w-6 h-6 mr-3 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">For Citizens</h2>
            </div>
            
            <div className="space-y-4">
              {citizenSections.map(section => {
                const IconComponent = section.icon;
                const isOpen = openSections[section.id];
                
                return (
                  <div key={section.id} id={section.id} className="bg-white border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
                    >
                      <div className="flex items-center">
                        <IconComponent className="w-5 h-5 mr-3 text-gray-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                          <p className="text-sm text-gray-600">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{section.questions.length} questions</span>
                        {isOpen ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {isOpen && (
                      <div className="border-t border-gray-200">
                        {section.questions.map((faq, index) => {
                          const isQuestionOpen = openQuestions[faq.id];
                          
                          return (
                            <div key={faq.id} className={`${index !== section.questions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                              <button
                                onClick={() => toggleQuestion(faq.id)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                              >
                                <h4 className="text-sm font-medium text-gray-900 pr-4">{faq.question}</h4>
                                {isQuestionOpen ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                              </button>
                              
                              {isQuestionOpen && (
                                <div className="px-6 pb-4">
                                  <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Still Have Questions?</h2>
          <p className="text-blue-800 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Contact Support
            </a>
            <a
              href="/government-user-guide"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-700 bg-white border border-blue-700 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Government User Guide
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;