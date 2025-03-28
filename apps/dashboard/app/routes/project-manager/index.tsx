import { useDate } from "@/components/date-context";
import DateSlider from "@/components/home/date-slider";
import HomeHeader from "@/components/home/home-header";
import ProjectManagerInbox from "@/components/project-manager/project-manager-inbox";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/project-manager/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentDate, setCurrentDate } = useDate();

  return (
    <div className="flex items-center justify-center h-full w-full rounded-md flex-col">
      <HomeHeader currentDate={currentDate} onDateChange={setCurrentDate} />
      <ProjectManagerInbox />
    </div>
  );
}
