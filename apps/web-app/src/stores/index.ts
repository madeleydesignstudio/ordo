// Simple stores for the application
// Using basic state management until proper stores are implemented
import { useState } from "react";

interface RecentPage {
  id: string;
  title: string;
  path: string;
  timestamp: Date;
}

interface NavigationHistory {
  id: string;
  title: string;
  path: string;
  visitedAt: Date;
  type: "project" | "journal" | "knowledge" | "settings";
}

// Mock data for recent pages
const mockRecentPages: RecentPage[] = [
  {
    id: "1",
    title: "Project Alpha",
    path: "/projects/alpha",
    timestamp: new Date(),
  },
  {
    id: "2",
    title: "Daily Journal",
    path: "/journal",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    title: "Knowledge Base",
    path: "/knowledge",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "4",
    title: "Settings",
    path: "/settings",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
];

// Simple hook to get recent pages
export function useRecentPages() {
  return {
    recentPages: mockRecentPages,
    addRecentPage: (page: Omit<RecentPage, "id" | "timestamp">) => {
      // TODO: Implement actual state management
      console.log("Adding recent page:", page);
    },
  };
}

// Simple hook for quick actions
export function useQuickActions() {
  return {
    quickActions: [
      {
        id: "new-project",
        title: "New Project",
        description: "Create a new project",
        action: () => console.log("New project"),
      },
      {
        id: "new-note",
        title: "New Note",
        description: "Create a new note",
        action: () => console.log("New note"),
      },
    ],
  };
}

// Simple hook for search state
export function useSearchState() {
  const [query, setQuery] = useState("");

  return {
    search: {
      query,
      results: [],
      isSearching: false,
    },
    setSearchQuery: (newQuery: string) => {
      setQuery(newQuery);
      console.log("Search query:", newQuery);
    },
    clearSearch: () => {
      setQuery("");
    },
  };
}

// Export types for use in components
export type { RecentPage, NavigationHistory };
