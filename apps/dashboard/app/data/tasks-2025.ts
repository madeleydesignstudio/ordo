interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

interface DayTasks {
  date: string;
  tasks: Task[];
}

const taskTitles = [
  "Review project documentation",
  "Client meeting",
  "Update website content",
  "Debug application",
  "Write test cases",
  "Team standup",
  "Code review",
  "Deploy updates",
  "Create presentation",
  "Research new technologies",
  "Update dependencies",
  "Refactor components",
  "Design system updates",
  "User testing",
  "Performance optimization",
];

function generateTasksForDate(): Task[] {
  const numTasks = Math.floor(Math.random() * 4) + 1; // 1-4 tasks
  const tasks: Task[] = [];

  const priorities: Array<"low" | "medium" | "high"> = [
    "low",
    "medium",
    "high",
  ];

  for (let i = 0; i < numTasks; i++) {
    tasks.push({
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
      completed: Math.random() > 0.5,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
    });
  }

  return tasks;
}

function generate2025Tasks(): DayTasks[] {
  const tasks: DayTasks[] = [];
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    tasks.push({
      date: d.toISOString().split("T")[0],
      tasks: generateTasksForDate(),
    });
  }

  return tasks;
}

export const tasks2025 = generate2025Tasks();
