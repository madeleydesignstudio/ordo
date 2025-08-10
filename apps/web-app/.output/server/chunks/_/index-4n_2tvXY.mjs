import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { startOfDay, parseISO, format, isAfter, subDays, addDays, isSameDay } from 'date-fns';
import { useQuery, queryOptions, useQueryClient, useMutation } from '@tanstack/react-query';
import { R as Route, B as Button, u as useRecentPages } from './ssr.mjs';
import { ChevronLeft, ChevronRight, Plus, Target, BookOpen, Clock } from 'lucide-react';
import '@tanstack/react-router';
import 'react';
import 'motion/react';
import 'react-dom';
import 'react-hotkeys-hook';
import 'zod';
import 'node:async_hooks';
import '@tanstack/react-router/ssr/server';

async function fetchMilestones() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    milestones: [
      {
        id: "1",
        title: "Launch Ordo",
        description: "Complete MVP and launch to public",
        targetDate: /* @__PURE__ */ new Date("2026-01-01"),
        progress: 45,
        category: "project"
      },
      {
        id: "2",
        title: "Complete Dashboard Design",
        targetDate: /* @__PURE__ */ new Date("2024-03-20"),
        progress: 80,
        category: "work"
      }
    ],
    total: 2
  };
}
async function fetchRoutines() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    morning: [
      { id: "1", title: "Meditate", completed: true, timeEstimate: "10 mins" },
      {
        id: "2",
        title: "Read for 45 mins",
        completed: false,
        timeEstimate: "45 mins"
      },
      {
        id: "3",
        title: "Review daily goals",
        completed: false,
        timeEstimate: "5 mins"
      }
    ],
    evening: [
      {
        id: "1",
        title: "Turn off electronics",
        completed: false,
        timeEstimate: "1 hour before bed"
      },
      {
        id: "2",
        title: "Reflect on the day",
        completed: false,
        timeEstimate: "10 mins"
      },
      {
        id: "3",
        title: "Prepare for tomorrow",
        completed: false,
        timeEstimate: "15 mins"
      }
    ],
    currentTasks: [
      {
        id: "1",
        title: "Complete Dashboard Design",
        completed: false,
        timeEstimate: "2 hours"
      },
      {
        id: "2",
        title: "Review project proposals",
        completed: true,
        timeEstimate: "30 mins"
      },
      {
        id: "3",
        title: "Team standup meeting",
        completed: false,
        timeEstimate: "15 mins"
      }
    ]
  };
}
async function fetchWeekEvents(startDate, endDate) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const events = {};
  const mondayKey = "2024-03-18";
  const wednesdayKey = "2024-03-20";
  const fridayKey = "2024-03-22";
  events[mondayKey] = [
    {
      id: `${mondayKey}-1`,
      title: "Team Standup",
      priority: "high",
      completed: false
    }
  ];
  events[wednesdayKey] = [
    {
      id: `${wednesdayKey}-1`,
      title: "Project Review",
      priority: "medium",
      completed: false
    },
    {
      id: `${wednesdayKey}-2`,
      title: "Client Meeting",
      priority: "high",
      completed: false
    }
  ];
  events[fridayKey] = [
    {
      id: `${fridayKey}-1`,
      title: "Weekly Planning",
      priority: "high",
      completed: false
    }
  ];
  return { events };
}
async function updateRoutineItem(id, completed) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    id,
    title: "Updated Item",
    completed,
    timeEstimate: "5 mins"
  };
}
async function addEvent(date, title, priority) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    id: `${date}-${Date.now()}`,
    title,
    priority,
    completed: false
  };
}
const milestonesQueryOptions = () => queryOptions({
  queryKey: ["milestones"],
  queryFn: fetchMilestones,
  staleTime: 5 * 60 * 1e3,
  // 5 minutes
  gcTime: 10 * 60 * 1e3
  // 10 minutes
});
const routinesQueryOptions = () => queryOptions({
  queryKey: ["routines"],
  queryFn: fetchRoutines,
  staleTime: 2 * 60 * 1e3,
  // 2 minutes
  gcTime: 5 * 60 * 1e3
  // 5 minutes
});
const weekEventsQueryOptions = (startDate, endDate) => queryOptions({
  queryKey: ["week-events", startDate, endDate],
  queryFn: () => fetchWeekEvents(),
  staleTime: 30 * 1e3,
  // 30 seconds
  gcTime: 2 * 60 * 1e3
  // 2 minutes
});
function MilestonesComponent() {
  const { data, isLoading, error } = useQuery(milestonesQueryOptions());
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 flex-1", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold mb-3 text-muted-foreground", children: "Upcoming Milestones" }),
      /* @__PURE__ */ jsx("div", { className: "relative h-32", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-muted rounded-full" }) }) }) })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 flex-1", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold mb-3 text-muted-foreground", children: "Upcoming Milestones" }),
      /* @__PURE__ */ jsx("div", { className: "relative h-32 flex items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Failed to load milestones" }) })
    ] });
  }
  const upcomingMilestones = (data == null ? void 0 : data.milestones.filter((m) => isAfter(m.targetDate, /* @__PURE__ */ new Date())).sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime()).slice(0, 3)) || [];
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 flex-1", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold mb-3 text-muted-foreground", children: "Upcoming Milestones" }),
    /* @__PURE__ */ jsx("div", { className: "relative h-32", children: upcomingMilestones.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full h-32", children: [
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "absolute inset-0 w-full h-full",
            viewBox: "0 0 400 80",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                d: "M50 40 Q150 15 250 40 Q350 65 380 40",
                stroke: "hsl(var(--border))",
                strokeWidth: "2",
                fill: "none",
                opacity: "0.3"
              }
            )
          }
        ),
        upcomingMilestones.map((milestone, index) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute",
            style: {
              left: `${20 + index * 60}%`,
              top: `${25 + index % 2 * 30}%`
            },
            children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsx("div", { className: "w-5 h-5 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold", children: index + 1 }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-center max-w-20", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium truncate", children: milestone.title }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: format(milestone.targetDate, "MMM d") })
              ] })
            ] })
          },
          milestone.id
        ))
      ] }) }),
      upcomingMilestones[0] && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 right-0", children: /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: format(upcomingMilestones[0].targetDate, "do MMMM yyyy") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: upcomingMilestones[0].title })
      ] }) })
    ] }) : /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No upcoming milestones" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Create your first milestone to get started" })
    ] }) }) })
  ] });
}
function getTimeBasedRoutine(routineData, activeDate) {
  const hour = activeDate.getHours();
  if (hour >= 5 && hour < 12) {
    return {
      title: "Morning Routine",
      items: (routineData == null ? void 0 : routineData.morning) || [],
      type: "morning"
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      title: "Current Tasks",
      items: (routineData == null ? void 0 : routineData.currentTasks) || [],
      type: "day"
    };
  } else {
    return {
      title: "Nightly Cooldown",
      items: (routineData == null ? void 0 : routineData.evening) || [],
      type: "evening"
    };
  }
}
function RoutineComponent({ activeDate }) {
  const queryClient = useQueryClient();
  const {
    data: routineData,
    isLoading,
    error
  } = useQuery(routinesQueryOptions());
  const updateItemMutation = useMutation({
    mutationFn: ({ id, completed }) => updateRoutineItem(id, completed),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      const action = variables.completed ? "completed" : "uncompleted";
      console.log(`Routine item ${action} successfully`);
    },
    onError: (error2) => {
      const errorMessage = (error2 == null ? void 0 : error2.message) || "Failed to update routine item";
      console.error("Failed to update routine item:", errorMessage);
    }
  });
  const handleItemToggle = (id, currentCompleted) => {
    updateItemMutation.mutate({ id, completed: !currentCompleted });
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsx("div", { className: "h-5 w-32 bg-muted animate-pulse rounded" }) }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsx("div", { className: "w-3 h-3 bg-muted animate-pulse rounded" }),
        /* @__PURE__ */ jsx("div", { className: "h-4 w-40 bg-muted animate-pulse rounded" })
      ] }, i)) })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 flex-1", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold mb-3 text-muted-foreground", children: "Routine" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "Failed to load routine data" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => {
              queryClient.invalidateQueries({ queryKey: ["routines"] });
              console.log("Retrying to load routine data...");
            },
            children: "Retry"
          }
        )
      ] }) })
    ] });
  }
  const routine = getTimeBasedRoutine(routineData, activeDate);
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 flex-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-muted-foreground", children: routine.title }),
      routine.type === "evening" && /* @__PURE__ */ jsx("span", { className: "text-sm text-primary", children: "Meditate" })
    ] }),
    routine.type === "evening" ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted/30 rounded-lg", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium", children: [
          "Good evening ",
          format(activeDate, "EEEE")
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Time to cooldown and setup for tomorrow." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: routine.items.slice(0, 3).map((item) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-center space-x-2 text-sm",
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleItemToggle(item.id, item.completed),
                disabled: updateItemMutation.isPending,
                className: `w-3 h-3 rounded border-2 transition-colors ${item.completed ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"} ${updateItemMutation.isPending ? "opacity-50" : ""}`
              }
            ),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: item.completed ? "line-through text-muted-foreground" : "",
                children: item.title
              }
            ),
            item.timeEstimate && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-auto text-xs", children: item.timeEstimate })
          ]
        },
        item.id
      )) }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "w-full mt-3", children: "View Routine" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: routine.items.length > 0 ? routine.items.map((item) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center space-x-2 p-2 rounded hover:bg-muted/30 transition-colors",
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleItemToggle(item.id, item.completed),
              disabled: updateItemMutation.isPending,
              className: `w-3 h-3 rounded border-2 transition-colors ${item.completed ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"} ${updateItemMutation.isPending ? "opacity-50" : ""}`
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx(
              "p",
              {
                className: `text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`,
                children: item.title
              }
            ),
            item.timeEstimate && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: item.timeEstimate })
          ] })
        ]
      },
      item.id
    )) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-20", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "No ",
      routine.type === "morning" ? "morning routine" : "tasks",
      " ",
      "for today"
    ] }) }) })
  ] });
}
function getIconForPath(path) {
  if (path.includes("/projects")) return Target;
  if (path.includes("/journal")) return BookOpen;
  if (path.includes("/knowledge")) return BookOpen;
  if (path.includes("/settings")) return Clock;
  return BookOpen;
}
function RecentlyVisitedComponent() {
  const { recentPages } = useRecentPages();
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold mb-3 text-muted-foreground", children: "Recently Visited" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-6 gap-2", children: recentPages.length > 0 ? recentPages.slice(0, 6).map((page) => {
      const Icon = getIconForPath(page.path);
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "p-2 rounded border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer",
          onClick: () => {
            console.log(`Navigate to ${page.path}`);
          },
          children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-1", children: [
            /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium truncate w-full text-center", children: page.title }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: format(page.timestamp, "HH:mm") })
          ] })
        },
        page.id
      );
    }) : /* @__PURE__ */ jsx("div", { className: "col-span-6 flex items-center justify-center h-20", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No recent visits" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your recently visited pages will appear here" })
    ] }) }) })
  ] });
}
function generateWeekData(centerDate, eventsData) {
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const date = addDays(centerDate, i);
    const dayName = format(date, "EEEE").toUpperCase();
    const dayNumber = date.getDate();
    const dateKey = format(date, "yyyy-MM-dd");
    const events = (eventsData == null ? void 0 : eventsData[dateKey]) || [];
    days.push({ date, dayName, dayNumber, events });
  }
  return days;
}
function WeeklyCalendarComponent({
  activeDate,
  onActiveDateChange
}) {
  const queryClient = useQueryClient();
  const startDate = format(subDays(activeDate, 3), "yyyy-MM-dd");
  const endDate = format(addDays(activeDate, 3), "yyyy-MM-dd");
  const {
    data: eventsData,
    isLoading,
    error
  } = useQuery(weekEventsQueryOptions(startDate, endDate));
  const addEventMutation = useMutation({
    mutationFn: ({
      date,
      title,
      priority
    }) => addEvent(date, title, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["week-events"] });
    }
  });
  const weekData = generateWeekData(activeDate, eventsData == null ? void 0 : eventsData.events);
  const navigatePrevious = () => {
    onActiveDateChange(subDays(activeDate, 1));
  };
  const navigateNext = () => {
    onActiveDateChange(addDays(activeDate, 1));
  };
  const goToToday = () => {
    onActiveDateChange(startOfDay(/* @__PURE__ */ new Date()));
  };
  const handleAddEvent = (date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const title = prompt("Enter event title:");
    if (title && title.trim()) {
      addEventMutation.mutate({
        date: dateKey,
        title: title.trim(),
        priority: "medium"
        // Default priority
      });
    }
  };
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 flex-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-muted-foreground", children: "This Week" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Failed to load calendar events" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-4 flex-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-muted-foreground", children: format(activeDate, "MMMM yyyy") }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: goToToday,
            className: "text-xs",
            children: "Today"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: navigatePrevious, children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: navigateNext, children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-2", children: weekData.map((day, index) => {
      const isActiveDay = isSameDay(day.date, activeDate);
      const isToday = isSameDay(day.date, /* @__PURE__ */ new Date());
      return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground", children: day.dayName }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => onActiveDateChange(day.date),
              className: `text-sm font-semibold rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-colors hover:bg-muted/40 ${isActiveDay ? "bg-primary text-primary-foreground" : isToday ? "bg-primary/20 text-primary" : ""}`,
              children: day.dayNumber
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `min-h-[100px] p-1 rounded border bg-muted/10 space-y-1 transition-all ${isActiveDay ? "ring-2 ring-primary/20 bg-primary/5" : ""}`,
            children: isLoading ? (
              // Loading skeleton
              /* @__PURE__ */ jsx("div", { className: "space-y-1", children: Array.from({ length: 2 }).map((_, i) => /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-6 bg-muted/40 rounded animate-pulse"
                },
                i
              )) })
            ) : /* @__PURE__ */ jsxs(Fragment, { children: [
              day.events.slice(0, 2).map((event) => /* @__PURE__ */ jsx(
                "div",
                {
                  className: `p-1 text-xs rounded cursor-pointer transition-colors ${event.priority === "high" ? "bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30" : event.priority === "medium" ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30" : "bg-muted/40 hover:bg-muted/60"} ${event.completed ? "opacity-60 line-through" : ""}`,
                  onClick: () => {
                    console.log("Event clicked:", event);
                  },
                  children: event.title
                },
                event.id
              )),
              day.events.length < 2 && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleAddEvent(day.date),
                  disabled: addEventMutation.isPending,
                  className: `flex items-center justify-center h-6 w-full border-2 border-dashed border-muted-foreground/30 rounded hover:border-muted-foreground/50 transition-colors ${addEventMutation.isPending ? "opacity-50" : ""}`,
                  children: /* @__PURE__ */ jsx(Plus, { className: "w-3 h-3 text-muted-foreground/50" })
                }
              )
            ] })
          }
        ),
        isActiveDay && /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-primary rounded-full mx-auto" }) })
      ] }, day.date.toISOString());
    }) }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-3 text-xs text-muted-foreground", children: /* @__PURE__ */ jsxs("span", { children: [
      format(weekData[0].date, "MMM d"),
      " -",
      " ",
      format(weekData[6].date, "MMM d, yyyy")
    ] }) })
  ] });
}
const SplitComponent = function Home() {
  const navigate = Route.useNavigate();
  const {
    date: dateParam
  } = Route.useSearch();
  const activeDate = dateParam ? startOfDay(parseISO(dateParam)) : startOfDay(/* @__PURE__ */ new Date());
  const dayName = format(activeDate, "EEEE").toUpperCase();
  const dayWithSuffix = format(activeDate, "do MMMM");
  const handleActiveDateChange = (newDate) => {
    const newDateParam = format(newDate, "yyyy-MM-dd");
    navigate({
      search: {
        date: newDateParam
      },
      replace: true
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col p-4 gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: dayName }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: dayWithSuffix })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 h-48", children: [
      /* @__PURE__ */ jsx(MilestonesComponent, {}),
      /* @__PURE__ */ jsx(RoutineComponent, { activeDate })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-24", children: /* @__PURE__ */ jsx(RecentlyVisitedComponent, {}) }),
    /* @__PURE__ */ jsx(WeeklyCalendarComponent, { activeDate, onActiveDateChange: handleActiveDateChange })
  ] });
};

export { SplitComponent as component };
//# sourceMappingURL=index-4n_2tvXY.mjs.map
