import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePublicBrowse } from '../../hooks/usePublicBrowse'
import PublicLayout from '../../components/PublicLayout'
import { supabase } from '../../lib/supabase'
import { 
  Building2, 
  MessageSquare, 
  Calendar,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

interface StateInfo {
  code: string
  name: string
  description: string
  population?: string
  capital?: string
}

interface AgencyInfo {
  id: string
  name: string
  slug: string
  jurisdiction: string
  description?: string
  docket_count: number
  comment_count: number
}

const StatePage = () => {
  const { stateCode } = useParams<{ stateCode: string }>()
  const [stateInfo, setStateInfo] = useState<StateInfo | null>(null)
  const [agencies, setAgencies] = useState<AgencyInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State information database
  const stateData: Record<string, StateInfo> = {
    'AL': { code: 'AL', name: 'Alabama', description: 'The Heart of Dixie', capital: 'Montgomery' },
    'AK': { code: 'AK', name: 'Alaska', description: 'The Last Frontier', capital: 'Juneau' },
    'AZ': { code: 'AZ', name: 'Arizona', description: 'The Grand Canyon State', capital: 'Phoenix' },
    'AR': { code: 'AR', name: 'Arkansas', description: 'The Natural State', capital: 'Little Rock' },
    'CA': { code: 'CA', name: 'California', description: 'The Golden State', capital: 'Sacramento' },
    'CO': { code: 'CO', name: 'Colorado', description: 'The Centennial State', capital: 'Denver' },
    'CT': { code: 'CT', name: 'Connecticut', description: 'The Constitution State', capital: 'Hartford' },
    'DE': { code: 'DE', name: 'Delaware', description: 'The First State', capital: 'Dover' },
    'FL': { code: 'FL', name: 'Florida', description: 'The Sunshine State', capital: 'Tallahassee' },
    'GA': { code: 'GA', name: 'Georgia', description: 'The Peach State', capital: 'Atlanta' },
    'HI': { code: 'HI', name: 'Hawaii', description: 'The Aloha State', capital: 'Honolulu' },
    'ID': { code: 'ID', name: 'Idaho', description: 'The Gem State', capital: 'Boise' },
    'IL': { code: 'IL', name: 'Illinois', description: 'The Prairie State', capital: 'Springfield' },
    'IN': { code: 'IN', name: 'Indiana', description: 'The Hoosier State', capital: 'Indianapolis' },
    'IA': { code: 'IA', name: 'Iowa', description: 'The Hawkeye State', capital: 'Des Moines' },
    'KS': { code: 'KS', name: 'Kansas', description: 'The Sunflower State', capital: 'Topeka' },
    'KY': { code: 'KY', name: 'Kentucky', description: 'The Bluegrass State', capital: 'Frankfort' },
    'LA': { code: 'LA', name: 'Louisiana', description: 'The Pelican State', capital: 'Baton Rouge' },
    'ME': { code: 'ME', name: 'Maine', description: 'The Pine Tree State', capital: 'Augusta' },
    'MD': { code: 'MD', name: 'Maryland', description: 'The Old Line State', capital: 'Annapolis' },
    'MA': { code: 'MA', name: 'Massachusetts', description: 'The Bay State', capital: 'Boston' },
    'MI': { code: 'MI', name: 'Michigan', description: 'The Great Lakes State', capital: 'Lansing' },
    'MN': { code: 'MN', name: 'Minnesota', description: 'The North Star State', capital: 'St. Paul' },
    'MS': { code: 'MS', name: 'Mississippi', description: 'The Magnolia State', capital: 'Jackson' },
    'MO': { code: 'MO', name: 'Missouri', description: 'The Show Me State', capital: 'Jefferson City' },
    'MT': { code: 'MT', name: 'Montana', description: 'The Treasure State', capital: 'Helena' },
    'NE': { code: 'NE', name: 'Nebraska', description: 'The Cornhusker State', capital: 'Lincoln' },
    'NV': { code: 'NV', name: 'Nevada', description: 'The Silver State', capital: 'Carson City' },
    'NH': { code: 'NH', name: 'New Hampshire', description: 'The Granite State', capital: 'Concord' },
    'NJ': { code: 'NJ', name: 'New Jersey', description: 'The Garden State', capital: 'Trenton' },
    'NM': { code: 'NM', name: 'New Mexico', description: 'The Land of Enchantment', capital: 'Santa Fe' },
    'NY': { code: 'NY', name: 'New York', description: 'The Empire State', capital: 'Albany' },
    'NC': { code: 'NC', name: 'North Carolina', description: 'The Tar Heel State', capital: 'Raleigh' },
    'ND': { code: 'ND', name: 'North Dakota', description: 'The Peace Garden State', capital: 'Bismarck' },
    'OH': { code: 'OH', name: 'Ohio', description: 'The Buckeye State', capital: 'Columbus' },
    'OK': { code: 'OK', name: 'Oklahoma', description: 'The Sooner State', capital: 'Oklahoma City' },
    'OR': { code: 'OR', name: 'Oregon', description: 'The Beaver State', capital: 'Salem' },
    'PA': { code: 'PA', name: 'Pennsylvania', description: 'The Keystone State', capital: 'Harrisburg' },
    'RI': { code: 'RI', name: 'Rhode Island', description: 'The Ocean State', capital: 'Providence' },
    'SC': { code: 'SC', name: 'South Carolina', description: 'The Palmetto State', capital: 'Columbia' },
    'SD': { code: 'SD', name: 'South Dakota', description: 'The Mount Rushmore State', capital: 'Pierre' },
    'TN': { code: 'TN', name: 'Tennessee', description: 'The Volunteer State', capital: 'Nashville' },
    'TX': { code: 'TX', name: 'Texas', description: 'The Lone Star State', capital: 'Austin' },
    'UT': { code: 'UT', name: 'Utah', description: 'The Beehive State', capital: 'Salt Lake City' },
    'VT': { code: 'VT', name: 'Vermont', description: 'The Green Mountain State', capital: 'Montpelier' },
    'VA': { code: 'VA', name: 'Virginia', description: 'The Old Dominion', capital: 'Richmond' },
    'WA': { code: 'WA', name: 'Washington', description: 'The Evergreen State', capital: 'Olympia' },
    'WV': { code: 'WV', name: 'West Virginia', description: 'The Mountain State', capital: 'Charleston' },
    'WI': { code: 'WI', name: 'Wisconsin', description: 'The Badger State', capital: 'Madison' },
    'WY': { code: 'WY', name: 'Wyoming', description: 'The Equality State', capital: 'Cheyenne' },
    'DC': { code: 'DC', name: 'District of Columbia', description: 'The Nation\'s Capital', capital: 'Washington' }
  }

  useEffect(() => {
    const fetchStateData = async () => {
      if (!stateCode) return

      setLoading(true)
      setError(null)

      try {
        // Set state info
        const state = stateData[stateCode.toUpperCase()]
        if (!state) {
          setError('State not found')
          setLoading(false)
          return
        }
        setStateInfo(state)

        // Fetch agencies for this state
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select(`
            id,
            name,
            slug,
            jurisdiction,
            description
          `)
          .eq('jurisdiction', state.name)
          .is('deleted_at', null)

        if (agencyError) {
          console.error('Error fetching agencies:', agencyError)
          setError('Failed to load agencies')
          return
        }

        // Transform the data and fetch counts for each agency
        const transformedAgencies = await Promise.all(
          agencyData?.map(async (agency: any) => {
            // Get docket count for this agency
            const { count: docketCount } = await supabase
              .from('dockets')
              .select('*', { count: 'exact', head: true })
              .eq('agency_id', agency.id)
              .eq('status', 'open')

            // Get comment count for this agency (approved comments only)
            // First get the docket IDs for this agency
            const { data: docketIds } = await supabase
              .from('dockets')
              .select('id')
              .eq('agency_id', agency.id)
              .eq('status', 'open')
            
            let commentCount = 0
            if (docketIds && docketIds.length > 0) {
              const docketIdList = docketIds.map((docket: any) => docket.id)
              const { count } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved')
                .in('docket_id', docketIdList)
              commentCount = count || 0
            }
            
            return {
              id: agency.id,
              name: agency.name,
              slug: agency.slug,
              jurisdiction: agency.jurisdiction,
              description: agency.description,
              docket_count: docketCount || 0,
              comment_count: commentCount
            }
          }) || []
        )

        setAgencies(transformedAgencies)
      } catch (err) {
        console.error('Error fetching state data:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStateData()
  }, [stateCode])

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading state information...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (error || !stateInfo) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">State Not Found</h1>
            <p className="text-gray-600 mb-6">The state you're looking for doesn't exist.</p>
            <Link 
              to="/" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between">
              {/* Left side - State flag */}
              <div className="flex-1 flex justify-center">
                <img 
                  src={`/states/flag-${stateInfo.code.toLowerCase()}.svg`}
                  alt={`${stateInfo.name} flag`}
                  className="w-32 h-32 object-contain"
                />
              </div>
              
              {/* Center - State info */}
              <div className="flex-1 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {stateInfo.name}
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  {stateInfo.description}
                </p>
                {stateInfo.capital && (
                  <div className="flex items-center justify-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Capital: {stateInfo.capital}</span>
                  </div>
                )}
              </div>
              
              {/* Right side - State outline */}
              <div className="flex-1 flex justify-center">
                <img 
                  src={`/states/outline-${stateInfo.code.toLowerCase()}.svg`}
                  alt={`${stateInfo.name} outline`}
                  className="w-32 h-32 object-contain opacity-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Agencies Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Government Agencies in {stateInfo.name}
            </h2>
            
            {agencies.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Agencies Found</h3>
                <p className="text-gray-600 mb-6">
                  There are currently no government agencies set up in {stateInfo.name}.
                </p>
                <Link 
                  to="/" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse All States
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {agencies.map((agency) => (
                  <div key={agency.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {agency.name}
                          </h3>
                          {agency.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {agency.description}
                            </p>
                          )}
                        </div>
                        <Building2 className="w-6 h-6 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span>{agency.docket_count} dockets</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{agency.comment_count} comments</span>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/agencies/${agency.slug}`}
                        className="inline-flex items-center w-full justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Agency
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* State Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Public Comment Opportunities
            </h3>
            <p className="text-gray-600">
              Browse the agencies above to find open dockets and opportunities to submit public comments 
              on regulations and policies in {stateInfo.name}.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export default StatePage 