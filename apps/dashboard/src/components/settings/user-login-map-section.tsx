import { useQuery } from '@tanstack/react-query'
import { UserLoginMap } from './geomap'

// Function to get user's current country
const getUserCountry = async (): Promise<string> => {
  try {
    // Use free IP geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.country_code) {
      return data.country_code;
    }
    
    throw new Error('Country code not found in response');
  } catch (error) {
    console.error("Error getting user's country:", error);
    // Fallback to a default country if we can't determine location
    return 'USA'; 
  }
};

// Convert country code to full name
const getCountryName = (code: string): string => {
  const countries: Record<string, string> = {
    'USA': 'United States',
    'GBR': 'United Kingdom',
    'CAN': 'Canada',
    'AUS': 'Australia',
    'DEU': 'Germany',
    'FRA': 'France',
    'IND': 'India',
    'CHN': 'China',
    'JPN': 'Japan',
    'BRA': 'Brazil',
    'RUS': 'Russia',
    'ZAF': 'South Africa',
    'MEX': 'Mexico'
  };
  
  return countries[code] || code;
};

export function UserLoginMapSection() {
  // Fetch the user's country
  const { data: userCountry, isLoading: countryLoading, isError: countryError } = useQuery({
    queryKey: ['userCountry'],
    queryFn: getUserCountry,
  });
  
  // Format data for the map - only the user's country with a value of 100 (max intensity)
  const mapData = userCountry 
    ? [{ id: userCountry, value: 100 }] 
    : [];
  
  if (countryLoading) {
    return (
      <div className="cursor-default">
        <div className="h-[400px] flex items-center justify-center">
          <p>Detecting your location...</p>
        </div>
      </div>
    );
  }
  
  if (countryError) {
    return (
      <div className="cursor-default">
        <div className="h-[400px] flex items-center justify-center">
          <p>Failed to detect your location. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const countryName = userCountry ? getCountryName(userCountry) : 'Unknown';
  
  return (
    <div className="cursor-default">
      <div className="mb-4 flex items-center">
        <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
        <span className="text-sm font-medium">
          {userCountry ? `You are currently in ${countryName} (${userCountry})` : 'Location unknown'}
        </span>
      </div>
      <UserLoginMap data={mapData} />
    </div>
  );
} 