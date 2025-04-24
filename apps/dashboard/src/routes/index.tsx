import { createFileRoute, redirect } from "@tanstack/react-router";

import { useDate } from "~/components/date-context";
import DateSlider from "~/components/home/date-slider";
import HomeHeader from "~/components/home/home-header";
import HomeMainContent from "~/components/home/home-main-content";

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/login",
      });
    }
    return { user: context.user };
  },
});

function Home() {
  const { currentDate, setCurrentDate } = useDate();

  return (
    <div className="flex items-center justify-center h-full w-full rounded-md flex-col">
      <HomeHeader currentDate={currentDate} onDateChange={setCurrentDate} />
      <HomeMainContent />
      <DateSlider currentDate={currentDate} onDateChange={setCurrentDate} />
    </div>
  );
}
