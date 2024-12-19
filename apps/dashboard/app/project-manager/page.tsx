"use client";

import { CalendarWeek } from "../components/home/calendar-week";
import Inbox from "../components/home/inbox";
import Journal from "../components/home/journal";
import CurrentDay from "../components/home/current-day";
import TodayButton from "../components/today-button";
import React, { useState } from "react";
import { startOfToday } from "date-fns";

export default function ProjectManager() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const goToToday = () => {
    const today = startOfToday();
    setSelectedDate(today);
  };

  return (
    <div className="flex flex-col h-screen pt-[40px]">
      <div className="flex items-center px-4 relative">
        <div className="absolute right-4">
          <TodayButton onClick={goToToday} />
        </div>
        <div className="flex-1 text-center">
          <CurrentDay date={selectedDate} />
        </div>
      </div>
      <div className="flex justify-between w-full flex-1 min-h-0">
        <div className="w-2/3">
          <Inbox />
        </div>
        <div className="w-1/3">
          <Journal />
        </div>
      </div>
      <CalendarWeek
        onDateChange={setSelectedDate}
        selectedDate={selectedDate}
      />
    </div>
  );
}
