import { useState, useEffect } from "react";

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

const WeatherDisplay = () => {
  const [weather, setWeather] = useState<{
    temp: number;
    conditions: string;
  } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=d6cb802840b2478bb0e233636252003&q=${position.coords.latitude},${position.coords.longitude}`
          );
          const data = await response.json();
          setWeather({
            temp: Math.round(data.current.temp_c),
            conditions: data.current.condition.text,
          });
        } catch (error) {
          console.error("Error fetching weather:", error);
        }
      });
    }
  }, []);

  if (!weather) return <div>Loading...</div>;

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
