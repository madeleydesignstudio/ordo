export interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

export const dummyEvents: Event[] = [
  // Existing events
  {
    id: 1,
    title: "Team Meeting",
    start: new Date(2023, 5, 15, 10, 0),
    end: new Date(2023, 5, 15, 11, 30),
  },
  {
    id: 2,
    title: "Lunch with Client",
    start: new Date(2023, 5, 16, 12, 0),
    end: new Date(2023, 5, 16, 13, 30),
  },
  {
    id: 3,
    title: "Project Deadline",
    start: new Date(2023, 5, 17, 9, 0),
    end: new Date(2023, 5, 17, 18, 0),
  },
  {
    id: 4,
    title: "Conference",
    start: new Date(2023, 5, 18),
    end: new Date(2023, 5, 20),
    allDay: true,
  },
  {
    id: 5,
    title: "Team Building",
    start: new Date(2023, 5, 22, 14, 0),
    end: new Date(2023, 5, 22, 17, 0),
  },
  {
    id: 6,
    title: "Product Launch",
    start: new Date(2023, 5, 25, 9, 0),
    end: new Date(2023, 5, 25, 12, 0),
  },
  {
    id: 7,
    title: "Board Meeting",
    start: new Date(2023, 5, 28, 15, 0),
    end: new Date(2023, 5, 28, 17, 0),
  },
  {
    id: 8,
    title: "Training Session",
    start: new Date(2023, 5, 30, 10, 0),
    end: new Date(2023, 5, 30, 16, 0),
  },
  {
    id: 9,
    title: "All-Day Event",
    start: new Date(2023, 6, 5),
    end: new Date(2023, 6, 5),
    allDay: true,
  },
  {
    id: 10,
    title: "Multi-Day Event",
    start: new Date(2023, 6, 7),
    end: new Date(2023, 6, 10),
    allDay: true,
  },
  // New events for December 2024
  {
    id: 11,
    title: "Holiday Party",
    start: new Date(2024, 11, 20, 19, 0),
    end: new Date(2024, 11, 20, 23, 0),
  },
  {
    id: 12,
    title: "Christmas Eve",
    start: new Date(2024, 11, 24),
    end: new Date(2024, 11, 24),
    allDay: true,
  },
  {
    id: 13,
    title: "Christmas Day",
    start: new Date(2024, 11, 25),
    end: new Date(2024, 11, 25),
    allDay: true,
  },
  {
    id: 14,
    title: "Year-End Review",
    start: new Date(2024, 11, 30, 9, 0),
    end: new Date(2024, 11, 30, 17, 0),
  },
  {
    id: 15,
    title: "New Year's Eve Celebration",
    start: new Date(2024, 11, 31, 20, 0),
    end: new Date(2025, 0, 1, 2, 0),
  },
  // New events for January 2025
  {
    id: 16,
    title: "New Year's Day",
    start: new Date(2025, 0, 1),
    end: new Date(2025, 0, 1),
    allDay: true,
  },
  {
    id: 17,
    title: "Q1 Planning Meeting",
    start: new Date(2025, 0, 6, 9, 0),
    end: new Date(2025, 0, 6, 17, 0),
  },
  {
    id: 18,
    title: "Team Building Workshop",
    start: new Date(2025, 0, 15, 13, 0),
    end: new Date(2025, 0, 17, 17, 0),
  },
  {
    id: 19,
    title: "Product Demo",
    start: new Date(2025, 0, 22, 14, 0),
    end: new Date(2025, 0, 22, 16, 0),
  },
  {
    id: 20,
    title: "Monthly Review",
    start: new Date(2025, 0, 31, 10, 0),
    end: new Date(2025, 0, 31, 12, 0),
  },
];
