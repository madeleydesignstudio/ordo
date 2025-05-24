import { useState, useEffect } from "react";

const TimeLocationDisplay = () => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [timezone] = useState(() => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return timeZone.split("/").pop()?.replace(/_/g, " ") || "";
    } catch {
      return "Unknown City";
    }
  });

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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
    <div className="flex text-[10px] justify-end items-center gap-4 h-full">
      <div className="text-neutral-500 text-center">{timezone}</div>
      <div className="text-neutral-400 text-center">{formatDay(currentTime)}</div>
      <div className="text-neutral-400 text-center">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};

export default TimeLocationDisplay;
