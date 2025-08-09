import { useSidebar } from "@ordo/ui/components/sidebar";
import { useFocus } from "@/context/focus-context";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

export function BottomNav() {
  const { state } = useSidebar();
  const { isFocused, toggleFocus } = useFocus();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState("Unknown Location");
  const leftPadding = state === "expanded" ? "pl-[250px]" : "pl-[85px]";

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get user's location
  useEffect(() => {
    const getLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              // Use a free geocoding service to get city name
              try {
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
                );
                const data = await response.json();
                const city = data.city || data.locality || "Unknown City";
                setLocation(city);
              } catch (error) {
                console.log("Geocoding failed:", error);
                setLocation("Location Available");
              }
            },
            (error) => {
              console.log("Geolocation error:", error);
              setLocation("Location Denied");
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
          );
        } else {
          setLocation("Location Not Supported");
        }
      } catch (error) {
        console.log("Location error:", error);
        setLocation("Location Error");
      }
    };

    getLocation();
  }, []);

  return (
    <nav
      className={`fixed bottom-0 right-0 z-50 h-[20px] flex items-center transition-[padding] duration-200 ease-linear ${leftPadding}`}
    >
      <div className="flex items-center justify-end w-full">
        <div className="flex items-center space-x-4 pr-4">
          <button
            onClick={toggleFocus}
            className=""
            title={isFocused ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            {isFocused ? (
              <MinimizeIcon className="h-3 w-3" />
            ) : (
              <MaximizeIcon className="h-3 w-3" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">{location}</span>
          <span className="text-xs text-muted-foreground">
            {format(currentTime, "eee d MMM")}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(currentTime, "h:mm a")}
          </span>
        </div>
      </div>
    </nav>
  );
}
