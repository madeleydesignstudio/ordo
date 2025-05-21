import { useQuery } from "@tanstack/react-query";

const getWeatherEmoji = (condition: string): string => {
  const lowercased = condition.toLowerCase();
  if (lowercased.includes("sunny") || lowercased.includes("clear")) return "☀️";
  if (lowercased.includes("rain")) return "🌧️";
  if (lowercased.includes("cloud")) return "☁️";
  if (lowercased.includes("snow")) return "❄️";
  if (lowercased.includes("thunder") || lowercased.includes("storm"))
    return "⛈️";
  if (lowercased.includes("mist") || lowercased.includes("fog")) return "🌫️";
  if (lowercased.includes("wind")) return "💨";
  if (lowercased.includes("overcast")) return "🌥️";
  return "🌡️"; // default
};

const LOCATION_CACHE_KEY = 'weather_location';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

const getLocation = async () => {
  // Check if we have cached location
  const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY);
  if (cachedLocation) {
    const locationData = JSON.parse(cachedLocation);
    const isLocationFresh = Date.now() - locationData.lastUpdated < CACHE_DURATION;
    
    if (isLocationFresh) {
      return locationData;
    }
  }

  // If no cached location or it's stale, request new location
  return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          lastUpdated: Date.now(),
        };
        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationData));
        resolve(locationData);
      },
      (error) => {
        reject(error);
      },
      { 
        timeout: 5000,
        enableHighAccuracy: true,
        maximumAge: CACHE_DURATION
      }
    );
  });
};

const fetchWeather = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=d6cb802840b2478bb0e233636252003&q=${latitude},${longitude}`
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Weather API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Weather API response:', data);

    // Check if we have the required data
    if (!data?.current) {
      console.error('Invalid weather data structure:', data);
      throw new Error('Invalid weather data structure');
    }

    if (typeof data.current.temp_c !== 'number') {
      console.error('Invalid temperature data:', data.current.temp_c);
      throw new Error('Invalid temperature data');
    }

    if (!data.current.condition?.text) {
      console.error('Invalid condition data:', data.current.condition);
      throw new Error('Invalid condition data');
    }

    return {
      temp: Math.round(data.current.temp_c),
      conditions: data.current.condition.text,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
};

const WeatherDisplay = () => {
  // Query for location
  const { data: location, error: locationError, isLoading: isLocationLoading } = useQuery({
    queryKey: ['location'],
    queryFn: getLocation,
    staleTime: CACHE_DURATION,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Query for weather data, depends on location
  const { data: weather, error: weatherError, isLoading: isWeatherLoading } = useQuery({
    queryKey: ['weather', location?.latitude, location?.longitude],
    queryFn: () => fetchWeather({ latitude: location!.latitude, longitude: location!.longitude }),
    enabled: !!location,
    staleTime: CACHE_DURATION,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (isLocationLoading || isWeatherLoading) {
    return (
      <div className="flex items-center gap-1 text-xs flex-col px-2.5">
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="text-xs text-red-500 px-2.5">
        {locationError instanceof Error ? locationError.message : 'Location access denied'}
      </div>
    );
  }

  if (weatherError) {
    return (
      <div className="text-xs text-red-500 px-2.5">
        {weatherError instanceof Error ? weatherError.message : 'Failed to fetch weather data'}
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="flex items-center gap-1 text-xs flex-col px-2.5">
      <div className="flex items-center gap-2">
        <span>{getWeatherEmoji(weather.conditions)}</span>
        <span>{weather.temp}°C</span>
        <span>{weather.conditions}</span>
      </div>
    </div>
  );
};

export default WeatherDisplay;
