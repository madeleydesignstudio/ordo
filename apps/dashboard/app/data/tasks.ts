interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  date: Date;
}

const taskTitles = [
  "Team meeting",
  "Project deadline",
  "Code review",
  "Client call",
  "Gym session",
  "Dentist appointment",
  "Grocery shopping",
  "Car maintenance",
  "Write blog post",
  "Pay bills",
];

const generateTasks = (): Task[] => {
  const tasks: Task[] = [];
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");
  const priorities: Task["priority"][] = ["low", "medium", "high"];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Generate 1-3 tasks per day
    const numTasks = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numTasks; i++) {
      const task: Task = {
        id: `${d.toISOString()}-${i}`,
        title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
        completed: Math.random() > 0.7, // 30% chance of being completed
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        date: new Date(d),
      };
      tasks.push(task);
    }
  }

  return tasks;
};

export const dummyTasks = generateTasks();
export type { Task };
