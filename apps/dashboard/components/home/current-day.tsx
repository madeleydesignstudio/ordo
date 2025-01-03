"use client";

import React from "react";

interface CurrentDayProps {
  date: Date;
}

export default function CurrentDay({ date }: CurrentDayProps) {
  const dayOfWeek = date.toLocaleString("default", { weekday: "long" });
  const month = date.toLocaleString("default", { month: "long" });
  const dayOfMonth = date.getDate();

  return (
    <div className="flex items-end justify-center text-center pt-2 space-x-4 text-[#6B9CA9] ">
      <h2 className="text-6xl font-bold">{dayOfWeek}</h2>
      <p className="text-xl">
        {dayOfMonth} {month}
      </p>
    </div>
  );
}
