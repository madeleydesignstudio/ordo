import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO, startOfDay } from "date-fns";
import { z } from "zod";
import {
  MilestonesComponent,
  RoutineComponent,
  RecentlyVisitedComponent,
  WeeklyCalendarComponent,
} from "@/components/home";

// Search params validation schema
const homeSearchSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/home/")({
  component: Home,
  validateSearch: homeSearchSchema,
  searchParams: {
    date: {
      default: format(new Date(), "yyyy-MM-dd"),
    },
  },
});

function Home() {
  const navigate = Route.useNavigate();
  const { date: dateParam } = Route.useSearch();

  // Parse the date from URL params or use today as fallback
  const activeDate = dateParam
    ? startOfDay(parseISO(dateParam))
    : startOfDay(new Date());

  const dayName = format(activeDate, "EEEE").toUpperCase();
  const dayWithSuffix = format(activeDate, "do MMMM");

  const handleActiveDateChange = (newDate: Date) => {
    const newDateParam = format(newDate, "yyyy-MM-dd");
    navigate({
      search: { date: newDateParam },
      replace: true,
    });
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{dayName}</h1>
        <p className="text-sm text-muted-foreground">{dayWithSuffix}</p>
      </div>

      {/* Top Row - Milestones and Routine */}
      <div className="flex gap-4 h-48">
        <MilestonesComponent />
        <RoutineComponent activeDate={activeDate} />
      </div>

      {/* Recently Visited */}
      <div className="h-24">
        <RecentlyVisitedComponent />
      </div>

      {/* Weekly Calendar */}
      <WeeklyCalendarComponent
        activeDate={activeDate}
        onActiveDateChange={handleActiveDateChange}
      />
    </div>
  );
}
