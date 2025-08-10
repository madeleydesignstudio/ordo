import { format, isAfter } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { milestonesQueryOptions } from "@/lib/home/queries";

export function MilestonesComponent() {
  const { data, isLoading, error } = useQuery(milestonesQueryOptions());

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 flex-1">
        <h3 className="text-base font-semibold mb-3 text-muted-foreground">
          Upcoming Milestones
        </h3>
        <div className="relative h-32">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-4 flex-1">
        <h3 className="text-base font-semibold mb-3 text-muted-foreground">
          Upcoming Milestones
        </h3>
        <div className="relative h-32 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Failed to load milestones
          </p>
        </div>
      </div>
    );
  }

  const upcomingMilestones =
    data?.milestones
      .filter((m) => isAfter(m.targetDate, new Date()))
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
      .slice(0, 3) || [];

  return (
    <div className="rounded-lg border bg-card p-4 flex-1">
      <h3 className="text-base font-semibold mb-3 text-muted-foreground">
        Upcoming Milestones
      </h3>
      <div className="relative h-32">
        {upcomingMilestones.length > 0 ? (
          <>
            {/* Milestone visualization - simplified timeline */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-32">
                {/* Background path */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 80"
                >
                  <path
                    d="M50 40 Q150 15 250 40 Q350 65 380 40"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>

                {/* Milestone markers */}
                {upcomingMilestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="absolute"
                    style={{
                      left: `${20 + index * 60}%`,
                      top: `${25 + (index % 2) * 30}%`,
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="mt-1 text-center max-w-20">
                        <p className="text-xs font-medium truncate">
                          {milestone.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(milestone.targetDate, "MMM d")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured milestone */}
            {upcomingMilestones[0] && (
              <div className="absolute bottom-0 right-0">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {format(upcomingMilestones[0].targetDate, "do MMMM yyyy")}
                  </p>
                  <p className="text-sm font-semibold">
                    {upcomingMilestones[0].title}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No upcoming milestones
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first milestone to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
