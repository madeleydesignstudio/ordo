import { queryOptions } from "@tanstack/react-query";
import {
  Milestone,
  RoutineItem,
  RecentVisit,
  DayEvent,
  WeekDay,
} from "./types";

// API Response Types
export interface MilestonesResponse {
  milestones: Milestone[];
  total: number;
}

export interface RoutineResponse {
  morning: RoutineItem[];
  evening: RoutineItem[];
  currentTasks: RoutineItem[];
}

export interface RecentVisitsResponse {
  visits: RecentVisit[];
  total: number;
}

export interface WeekEventsResponse {
  events: Record<string, DayEvent[]>; // key is date string (YYYY-MM-DD)
}

// API Functions (will be replaced with actual API calls)
async function fetchMilestones(): Promise<MilestonesResponse> {
  // TODO: Replace with actual API call
  // return fetch('/api/milestones').then(res => res.json())

  // Mock data for now
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

  return {
    milestones: [
      {
        id: "1",
        title: "Launch Ordo",
        description: "Complete MVP and launch to public",
        targetDate: new Date("2026-01-01"),
        progress: 45,
        category: "project",
      },
      {
        id: "2",
        title: "Complete Dashboard Design",
        targetDate: new Date("2024-03-20"),
        progress: 80,
        category: "work",
      },
    ],
    total: 2,
  };
}

async function fetchRoutines(): Promise<RoutineResponse> {
  // TODO: Replace with actual API call
  // return fetch('/api/routines').then(res => res.json())

  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    morning: [
      { id: "1", title: "Meditate", completed: true, timeEstimate: "10 mins" },
      {
        id: "2",
        title: "Read for 45 mins",
        completed: false,
        timeEstimate: "45 mins",
      },
      {
        id: "3",
        title: "Review daily goals",
        completed: false,
        timeEstimate: "5 mins",
      },
    ],
    evening: [
      {
        id: "1",
        title: "Turn off electronics",
        completed: false,
        timeEstimate: "1 hour before bed",
      },
      {
        id: "2",
        title: "Reflect on the day",
        completed: false,
        timeEstimate: "10 mins",
      },
      {
        id: "3",
        title: "Prepare for tomorrow",
        completed: false,
        timeEstimate: "15 mins",
      },
    ],
    currentTasks: [
      {
        id: "1",
        title: "Complete Dashboard Design",
        completed: false,
        timeEstimate: "2 hours",
      },
      {
        id: "2",
        title: "Review project proposals",
        completed: true,
        timeEstimate: "30 mins",
      },
      {
        id: "3",
        title: "Team standup meeting",
        completed: false,
        timeEstimate: "15 mins",
      },
    ],
  };
}

async function fetchRecentVisits(): Promise<RecentVisitsResponse> {
  // TODO: Replace with actual API call
  // return fetch('/api/recent-visits').then(res => res.json())

  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    visits: [
      {
        id: "1",
        title: "Project Alpha",
        path: "/projects/alpha",
        visitedAt: new Date(),
        type: "project",
      },
      {
        id: "2",
        title: "Daily Journal",
        path: "/journal",
        visitedAt: new Date(Date.now() - 1000 * 60 * 30),
        type: "journal",
      },
      {
        id: "3",
        title: "Knowledge Base",
        path: "/knowledge",
        visitedAt: new Date(Date.now() - 1000 * 60 * 60),
        type: "knowledge",
      },
      {
        id: "4",
        title: "Settings",
        path: "/settings",
        visitedAt: new Date(Date.now() - 1000 * 60 * 120),
        type: "settings",
      },
      {
        id: "5",
        title: "Project Beta",
        path: "/projects/beta",
        visitedAt: new Date(Date.now() - 1000 * 60 * 180),
        type: "project",
      },
      {
        id: "6",
        title: "Meeting Notes",
        path: "/journal/meeting",
        visitedAt: new Date(Date.now() - 1000 * 60 * 240),
        type: "journal",
      },
    ],
    total: 6,
  };
}

async function fetchWeekEvents(
  startDate: string,
  endDate: string,
): Promise<WeekEventsResponse> {
  // TODO: Replace with actual API call
  // return fetch(`/api/events?start=${startDate}&end=${endDate}`).then(res => res.json())

  await new Promise((resolve) => setTimeout(resolve, 400));

  // Mock events for specific dates
  const events: Record<string, DayEvent[]> = {};

  // Add sample events
  const mondayKey = "2024-03-18"; // Example Monday
  const wednesdayKey = "2024-03-20"; // Example Wednesday
  const fridayKey = "2024-03-22"; // Example Friday

  events[mondayKey] = [
    {
      id: `${mondayKey}-1`,
      title: "Team Standup",
      priority: "high",
      completed: false,
    },
  ];

  events[wednesdayKey] = [
    {
      id: `${wednesdayKey}-1`,
      title: "Project Review",
      priority: "medium",
      completed: false,
    },
    {
      id: `${wednesdayKey}-2`,
      title: "Client Meeting",
      priority: "high",
      completed: false,
    },
  ];

  events[fridayKey] = [
    {
      id: `${fridayKey}-1`,
      title: "Weekly Planning",
      priority: "high",
      completed: false,
    },
  ];

  return { events };
}

// Mutation Functions
async function updateRoutineItem(
  id: string,
  completed: boolean,
): Promise<RoutineItem> {
  // TODO: Replace with actual API call
  // return fetch(`/api/routines/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) }).then(res => res.json())

  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    id,
    title: "Updated Item",
    completed,
    timeEstimate: "5 mins",
  };
}

async function addEvent(
  date: string,
  title: string,
  priority: "high" | "medium" | "low",
): Promise<DayEvent> {
  // TODO: Replace with actual API call
  // return fetch('/api/events', { method: 'POST', body: JSON.stringify({ date, title, priority }) }).then(res => res.json())

  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    id: `${date}-${Date.now()}`,
    title,
    priority,
    completed: false,
  };
}

// Query Options
export const milestonesQueryOptions = () =>
  queryOptions({
    queryKey: ["milestones"],
    queryFn: fetchMilestones,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

export const routinesQueryOptions = () =>
  queryOptions({
    queryKey: ["routines"],
    queryFn: fetchRoutines,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

export const recentVisitsQueryOptions = () =>
  queryOptions({
    queryKey: ["recent-visits"],
    queryFn: fetchRecentVisits,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

export const weekEventsQueryOptions = (startDate: string, endDate: string) =>
  queryOptions({
    queryKey: ["week-events", startDate, endDate],
    queryFn: () => fetchWeekEvents(startDate, endDate),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });

// Export mutation functions for use in components
export { updateRoutineItem, addEvent };
