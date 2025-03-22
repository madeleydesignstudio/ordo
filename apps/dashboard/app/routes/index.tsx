// app/routes/index.tsx
import DateSlider from "@/components/date-slider";
import HomeHeader from "@/components/home-header";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div className="flex items-center justify-center h-full w-full rounded-md flex-col">
      <HomeHeader currentDate={currentDate} onDateChange={setCurrentDate} />
      <div className="h-[77.5%] w-full p-2.5  ">
        <div className="bg-neutral-900 w-full flex flex-col justify-between h-full border border-neutral-600 rounded-md py-5 px-[20%] gap-5">
          <div className="h-1/4 w-full flex flex-col gap-2">
            <h2 className="text-xs text-neutral-300">Recently Active</h2>
            <div className="bg-neutral-800 rounded-md border border-neutral-600 flex-1"></div>
          </div>
          <div className="h-2/4 w-full flex flex-col gap-2">
            <h2 className="text-xs text-neutral-300">Upcoming Events</h2>
            <div className="bg-neutral-800 rounded-md border border-neutral-600 flex-1"></div>
          </div>
          <div className="h-1/4 w-full flex flex-col gap-2">
            <h2 className="text-xs text-neutral-300">Recently Contacted</h2>
            <div className="bg-neutral-800 rounded-md border border-neutral-600 flex-1"></div>
          </div>
        </div>
      </div>
      <div className="h-[15%] border-t border-neutral-600 w-full">
        <DateSlider currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>
    </div>
  );
}
