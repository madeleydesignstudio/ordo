// app/routes/index.tsx
import DateSlider from "@/components/date-slider";
import HomeHeader from "@/components/home-header";
import HomeMainContent from "@/components/home-main-content";
import { createFileRoute } from "@tanstack/react-router";
import { useDate } from "@/components/date-context";

export const Route = createFileRoute("/")({
  component: Home,
});

export default function Home() {
  const { currentDate, setCurrentDate } = useDate();

  return (
    <div className="flex items-center justify-center h-full w-full rounded-md flex-col">
      <HomeHeader currentDate={currentDate} onDateChange={setCurrentDate} />
      <HomeMainContent />
      <div className="h-[15%] border-t border-neutral-600 w-full">
        <DateSlider currentDate={currentDate} onDateChange={setCurrentDate} />
      </div>
    </div>
  );
}
