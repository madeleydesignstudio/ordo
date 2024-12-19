import { CalendarWeek } from "../components/home/calendar-week";
import Inbox from "../components/home/inbox";
import Journal from "../components/home/journal";
import CurrentDay from "../components/home/current-day";

export default function ProjectManager() {
  return (
    <div className="flex flex-col h-screen pt-[40px]">
      <CurrentDay />
      <div className="flex justify-between w-full flex-1 min-h-0">
        <Inbox />
        <Journal />
      </div>
      <CalendarWeek />
    </div>
  );
}
