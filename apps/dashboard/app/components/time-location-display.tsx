import { useState, useEffect } from "react";

const TimeLocationDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Get timezone information
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Get only the city part after the last '/'
      const city = timeZone.split("/").pop()?.replace(/_/g, " ") || "";
      setTimezone(city);
    } catch (error) {
      setTimezone("Unknown City");
    }

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      //   second: "2-digit",
    });
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      //   year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex text-neutral-300 justify-end items-center gap-4 h-full">
      <div className="text-xs text-neutral-500 text-center">{timezone}</div>
      <div className="text-xs text-center">{formatDay(currentTime)}</div>
      <div className="text-xs font-bold text-center">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

export default TimeLocationDisplay;
