// app/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import DateSlider from "@/components/date-slider";
import WeatherDisplay from "@/components/weather-display";

export const Route = createFileRoute("/")({
  component: Home,
});

const formatDate = (date: Date) => {
  const day = date.getDate();
  const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : day % 10];
  return date
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/(\d+)/, `${day}${suffix}`);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
};

function Home() {
  return (
    <div className="flex items-center justify-center h-full w-full rounded-md flex-col">
      <div className="h-[7.5%] w-full flex justify-between items-center">
        <div className="w-1/3 text-neutral-300">
          <div className="flex  gap-1 text-xs flex-col px-2.5">
            <h3>{getGreeting()}, Daniel Madeley</h3>
          </div>
        </div>
        <div className="w-1/3 text-center text-neutral-300 font-bold flex items-end justify-center gap-1">
          <span className="text-4xl">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
          </span>
          <span className="text-sm">
            {new Date()
              .toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
              })
              .replace(/(\d+)/, (match) => {
                const day = parseInt(match);
                const suffix = ["th", "st", "nd", "rd"][
                  day % 10 > 3 ? 0 : day % 10
                ];
                return `${day}${suffix}`;
              })}
          </span>
        </div>
        <div className="w-1/3 flex justify-end items-center gap-2 text-neutral-300 font-light">
          <WeatherDisplay />
        </div>
      </div>
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
        <DateSlider />
      </div>
    </div>
  );
}
