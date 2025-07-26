import React from 'react';
import { ChevronDown } from 'lucide-react';

const StateDirectory = () => {
  const [selectedState, setSelectedState] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const states = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' }
  ];

  const handleStateSelect = (stateCode: string) => {
    setSelectedState(stateCode);
    setShowDropdown(false);
    // Navigate to state subdomain
    window.location.href = `https://${stateCode.toLowerCase()}.opencomments.us`;
  };

  // Flag-style coloring: Blue field (top-left) + Red/White stripes
  const getStateColor = (stateCode: string): 'red' | 'white' | 'blue' => {
    // Blue field (like flag's star section) - top-left geographic area
    const blueStates = ['AK', 'WA', 'ID', 'MT', 'OR', 'NV', 'WY', 'CA', 'UT', 'CO'];
    
    if (blueStates.includes(stateCode)) {
      return 'blue';
    }
    
    // Red/White stripes for remaining states (alternating by visual rows)
    const redStates = ['ME', 'ND', 'MN', 'WI', 'IL', 'NE', 'MO', 'KY', 'OK', 'MS', 'NY', 'MA', 'WV', 'VA', 'MD', 'DE', 'LA', 'AL', 'GA'];
    
    return redStates.includes(stateCode) ? 'red' : 'white';
  };
  const StateSquare = ({ code, onClick, color }: { code: string; onClick: () => void; color: 'red' | 'white' | 'blue' }) => {
    const getColors = () => {
      switch (color) {
        case 'red':
          return {
            bg: '#D9253A',
            hover: '#B91C2E',
            text: 'white'
          };
        case 'blue':
          return {
            bg: '#0050D8',
            hover: '#003fb5',
            text: 'white'
          };
        case 'white':
          return {
            bg: 'white',
            hover: '#f3f4f6',
            text: '#374151',
            border: '#d1d5db'
          };
      }
    };

    const colors = getColors();

    return (
    <div
      className="w-12 h-12 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors duration-200 border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border || colors.bg
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg;
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Visit ${states.find(s => s.code === code)?.name} comment portal`}
    >
      {code}
    </div>
    );
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F0F0F0' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Comments by State</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find comments and dockets in your local area
          </p>
        </div>

        {/* State Dropdown */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full px-4 py-3 text-left bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className={selectedState ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedState ? states.find(s => s.code === selectedState)?.name : 'Choose a state...'}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {states.map((state) => (
                  <button
                    key={state.code}
                    onClick={() => handleStateSelect(state.code)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{state.name}</span>
                      <span className="text-sm text-gray-500">{state.code}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Square US Map */}
        <div className="flex justify-center">
          <div className="inline-block">
            {/* Row 1 - Alaska (far left) and Northeast */}
            <div className="flex gap-1 mb-1">
              <StateSquare code="AK" onClick={() => handleStateSelect('AK')} color={getStateColor('AK')} />
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <StateSquare code="ME" onClick={() => handleStateSelect('ME')} color={getStateColor('ME')} />
            </div>
            
            {/* Row 2 - Michigan sticking up and Northeast */}
            <div className="flex gap-1 mb-1">
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <StateSquare code="MI" onClick={() => handleStateSelect('MI')} color={getStateColor('MI')} />
              <div className="w-12"></div>
              <StateSquare code="VT" onClick={() => handleStateSelect('VT')} color={getStateColor('VT')} />
              <StateSquare code="NH" onClick={() => handleStateSelect('NH')} color={getStateColor('NH')} />
            </div>
            
            {/* Row 3 - Northern border states */}
            <div className="flex gap-1 mb-1">
              <StateSquare code="WA" onClick={() => handleStateSelect('WA')} color={getStateColor('WA')} />
              <StateSquare code="ID" onClick={() => handleStateSelect('ID')} color={getStateColor('ID')} />
              <StateSquare code="MT" onClick={() => handleStateSelect('MT')} color={getStateColor('MT')} />
              <StateSquare code="ND" onClick={() => handleStateSelect('ND')} color={getStateColor('ND')} />
              <StateSquare code="MN" onClick={() => handleStateSelect('MN')} color={getStateColor('MN')} />
              <StateSquare code="WI" onClick={() => handleStateSelect('WI')} color={getStateColor('WI')} />
              <StateSquare code="IL" onClick={() => handleStateSelect('IL')} color={getStateColor('IL')} />
              <StateSquare code="NY" onClick={() => handleStateSelect('NY')} color={getStateColor('NY')} />
              <StateSquare code="MA" onClick={() => handleStateSelect('MA')} color={getStateColor('MA')} />
            </div>
            
            {/* Row 4 - Upper middle tier */}
            <div className="flex gap-1 mb-1">
              <StateSquare code="OR" onClick={() => handleStateSelect('OR')} color={getStateColor('OR')} />
              <StateSquare code="NV" onClick={() => handleStateSelect('NV')} color={getStateColor('NV')} />
              <StateSquare code="WY" onClick={() => handleStateSelect('WY')} color={getStateColor('WY')} />
              <StateSquare code="SD" onClick={() => handleStateSelect('SD')} color={getStateColor('SD')} />
              <StateSquare code="IA" onClick={() => handleStateSelect('IA')} color={getStateColor('IA')} />
              <StateSquare code="IN" onClick={() => handleStateSelect('IN')} color={getStateColor('IN')} />
              <StateSquare code="OH" onClick={() => handleStateSelect('OH')} color={getStateColor('OH')} />
              <StateSquare code="PA" onClick={() => handleStateSelect('PA')} color={getStateColor('PA')} />
              <StateSquare code="NJ" onClick={() => handleStateSelect('NJ')} color={getStateColor('NJ')} />
              <StateSquare code="CT" onClick={() => handleStateSelect('CT')} color={getStateColor('CT')} />
              <StateSquare code="RI" onClick={() => handleStateSelect('RI')} color={getStateColor('RI')} />
            </div>
            
            {/* Row 5 - Middle tier */}
            <div className="flex gap-1 mb-1">
              <StateSquare code="CA" onClick={() => handleStateSelect('CA')} color={getStateColor('CA')} />
              <StateSquare code="UT" onClick={() => handleStateSelect('UT')} color={getStateColor('UT')} />
              <StateSquare code="CO" onClick={() => handleStateSelect('CO')} color={getStateColor('CO')} />
              <StateSquare code="NE" onClick={() => handleStateSelect('NE')} color={getStateColor('NE')} />
              <StateSquare code="MO" onClick={() => handleStateSelect('MO')} color={getStateColor('MO')} />
              <StateSquare code="KY" onClick={() => handleStateSelect('KY')} color={getStateColor('KY')} />
              <StateSquare code="WV" onClick={() => handleStateSelect('WV')} color={getStateColor('WV')} />
              <StateSquare code="VA" onClick={() => handleStateSelect('VA')} color={getStateColor('VA')} />
              <StateSquare code="MD" onClick={() => handleStateSelect('MD')} color={getStateColor('MD')} />
              <StateSquare code="DE" onClick={() => handleStateSelect('DE')} color={getStateColor('DE')} />
            </div>
            
            {/* Row 6 - Lower middle tier */}
            <div className="flex gap-1 mb-1">
              <div className="w-12"></div>
              <StateSquare code="AZ" onClick={() => handleStateSelect('AZ')} color={getStateColor('AZ')} />
              <StateSquare code="NM" onClick={() => handleStateSelect('NM')} color={getStateColor('NM')} />
              <StateSquare code="KS" onClick={() => handleStateSelect('KS')} color={getStateColor('KS')} />
              <StateSquare code="AR" onClick={() => handleStateSelect('AR')} color={getStateColor('AR')} />
              <StateSquare code="TN" onClick={() => handleStateSelect('TN')} color={getStateColor('TN')} />
              <StateSquare code="NC" onClick={() => handleStateSelect('NC')} color={getStateColor('NC')} />
              <StateSquare code="SC" onClick={() => handleStateSelect('SC')} color={getStateColor('SC')} />
              <StateSquare code="DC" onClick={() => handleStateSelect('DC')} color={getStateColor('DC')} />
            </div>
            
            {/* Row 7 - Southern tier */}
            <div className="flex gap-1 mb-1">
              <div className="w-12"></div>
              <div className="w-12"></div>
              <StateSquare code="OK" onClick={() => handleStateSelect('OK')} color={getStateColor('OK')} />
              <StateSquare code="LA" onClick={() => handleStateSelect('LA')} color={getStateColor('LA')} />
              <StateSquare code="MS" onClick={() => handleStateSelect('MS')} color={getStateColor('MS')} />
              <StateSquare code="AL" onClick={() => handleStateSelect('AL')} color={getStateColor('AL')} />
              <StateSquare code="GA" onClick={() => handleStateSelect('GA')} color={getStateColor('GA')} />
            </div>
            
            {/* Row 8 - Bottom extensions (Hawaii, Texas, Florida sticking down) */}
            <div className="flex gap-1">
              <StateSquare code="HI" onClick={() => handleStateSelect('HI')} color={getStateColor('HI')} />
              <div className="w-12"></div>
              <StateSquare code="TX" onClick={() => handleStateSelect('TX')} color={getStateColor('TX')} />
              <div className="w-12"></div>
              <div className="w-12"></div>
              <div className="w-12"></div>
              <StateSquare code="FL" onClick={() => handleStateSelect('FL')} color={getStateColor('FL')} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StateDirectory;