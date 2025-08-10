// Types for home page components
export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  progress: number; // 0-100
  category: "project" | "personal" | "work";
}

export interface RoutineItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timeEstimate?: string;
}

export interface RecentVisit {
  id: string;
  title: string;
  path: string;
  visitedAt: Date;
  type: "project" | "journal" | "knowledge" | "settings";
}

export interface DayEvent {
  id: string;
  title: string;
  time?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  events: DayEvent[];
}

export interface TimeBasedRoutine {
  title: string;
  items: RoutineItem[];
  type: "morning" | "day" | "evening";
}
