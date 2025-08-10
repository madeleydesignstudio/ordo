import { format } from "date-fns";
import { Target, BookOpen, Clock } from "lucide-react";
import { useRecentPages } from "@/stores";
import { NavigationHistory } from "@/stores";

function getIconForPath(path: string) {
  if (path.includes("/projects")) return Target;
  if (path.includes("/journal")) return BookOpen;
  if (path.includes("/knowledge")) return BookOpen;
  if (path.includes("/settings")) return Clock;
  return BookOpen;
}

export function RecentlyVisitedComponent() {
  const { recentPages } = useRecentPages();

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="text-base font-semibold mb-3 text-muted-foreground">
        Recently Visited
      </h3>
      <div className="grid grid-cols-6 gap-2">
        {recentPages.length > 0 ? (
          recentPages.slice(0, 6).map((page) => {
            const Icon = getIconForPath(page.path);
            return (
              <div
                key={page.id}
                className="p-2 rounded border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => {
                  // TODO: Navigate to the visited page
                  // This would use TanStack Router navigation
                  console.log(`Navigate to ${page.path}`);
                }}
              >
                <div className="flex flex-col items-center space-y-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium truncate w-full text-center">
                    {page.title}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {format(page.timestamp, "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-6 flex items-center justify-center h-20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No recent visits</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your recently visited pages will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
