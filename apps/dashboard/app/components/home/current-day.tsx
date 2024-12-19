"use client";

import React, { useState, useEffect } from "react";

export default function CurrentDay() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(timer);
    };
  }, []);

  const dayOfWeek = currentDate.toLocaleString("default", { weekday: "long" });
  const month = currentDate.toLocaleString("default", { month: "long" });
  const dayOfMonth = currentDate.getDate();

  return (
    <div className=" flex items-end justify-center text-center p-4 space-x-4 text-[#6B9CA9]">
      <h2 className="text-6xl font-bold">{dayOfWeek}</h2>
      <p className="text-xl mt-2">
        {dayOfMonth} {month}
      </p>
    </div>
  );
}
