import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from "date-fns";
import { ResponsiveBar } from "@nivo/bar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ProjectLayout from "~/components/project-manager/project-layout";
import { ProjectData } from "~/components/project-manager/project-layout";

// Define interfaces that match our shared types but with additional fields needed for the inbox page
interface ProjectWithStatus {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
}

interface TaskWithDate {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  dueDate?: string | null;
  priority?: string;
  projectId?: string | null;
  createdAt?: string;
  completedAt?: string | null;
}

// Remove mock data and add API client functions
const fetchProjects = async () => {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const data = await response.json();
  // Make sure we return an array, even if the API structure is different
  return Array.isArray(data.projects) ? data.projects : [];
};

const fetchTasks = async () => {
  // Get tasks from the last 30 days for analytics
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  const today = new Date().toISOString();

  const url = `/api/tasks?startDate=${thirtyDaysAgo}&endDate=${today}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  const data = await response.json();
  // Make sure we return an array
  return Array.isArray(data) ? data : [];
};

// Generate colors for the charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const Route = createFileRoute("/project-manager/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  // Replace useState with useQuery hooks
  const {
    data: projectsData = { projects: [] },
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", "analytics"],
    queryFn: fetchTasks,
  });

  // Ensure projects is always an array before filtering
  const projects = Array.isArray(projectsData) ? projectsData : [];

  // Derive active projects from the fetched data
  const activeProjects = projects
    .filter(
      (project: ProjectWithStatus) =>
        project.status !== "completed" && project.status !== "archived",
    )
    .sort((a: ProjectWithStatus, b: ProjectWithStatus) => {
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
      );
    })
    .slice(0, 3);

  // Prepare data for our layout system
  const layoutData: ProjectData = {
    projects: projects,
    tasks: tasks
  };

  // Calculate tasks completed this week
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  
  const tasksByDay = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
    const dayTasks = tasks.filter((task: TaskWithDate) => 
      task.completedAt && 
      isWithinInterval(new Date(task.completedAt), { start: day, end: new Date(day.setHours(23, 59, 59, 999)) })
    );
    
    return {
      day: format(day, 'EEE'),
      count: dayTasks.length
    };
  });

  // Calculate tasks by status for pie chart
  const tasksByStatus = tasks.reduce((acc: Record<string, number>, task: TaskWithDate) => {
    const status = task.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(tasksByStatus).map(([status, count], index) => ({
    name: status.replace('_', ' '),
    value: count,
    color: COLORS[index % COLORS.length]
  }));

  // Find projects with upcoming deadlines
  const projectsWithDeadlines = projects
    .filter((project: ProjectWithStatus) => project.dueDate && new Date(project.dueDate) > new Date())
    .sort((a: ProjectWithStatus, b: ProjectWithStatus) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dateA - dateB;
    })
    .slice(0, 5);

  // Prepare data for the project deadline chart
  const deadlineChartData = projectsWithDeadlines.map((project: ProjectWithStatus) => {
    const dueDate = project.dueDate ? new Date(project.dueDate) : new Date();
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      daysLeft: daysLeft
    };
  });

  return (
    <div className="h-full overflow-auto">
      {(projectsError || tasksError) && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-md m-4">
          <p className="text-red-400">Error: {String(projectsError || tasksError)}</p>
        </div>
      )}
      
      {isLoadingProjects || isLoadingTasks ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-neutral-400">Loading...</p>
        </div>
      ) : (
        <div className="space-y-8 p-6">
          <h1 className="text-2xl font-bold text-neutral-100">Project Analytics</h1>

          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tasks Completed This Week */}
            <section className="rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-neutral-200">
                Tasks Completed This Week
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tasksByDay} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Completed Tasks" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Task Status Distribution */}
            <section className="rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-neutral-200">
                Task Status Distribution
              </h2>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#333', border: 'none' }} 
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Project Deadlines */}
            <section className="rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-neutral-200">
                Project Deadlines (Days Left)
              </h2>
              <div className="h-64">
                <ResponsiveBar
                  data={deadlineChartData}
                  keys={['daysLeft']}
                  indexBy="name"
                  margin={{ top: 10, right: 10, bottom: 50, left: 60 }}
                  padding={0.3}
                  colors={{ scheme: 'purple_blue' }}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Project',
                    legendPosition: 'middle',
                    legendOffset: 45
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Days Left',
                    legendPosition: 'middle',
                    legendOffset: -50
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  theme={{
                    axis: {
                      domain: {
                        line: {
                          stroke: '#555'
                        }
                      },
                      ticks: {
                        text: {
                          fill: '#888'
                        },
                        line: {
                          stroke: '#444'
                        }
                      }
                    },
                    grid: {
                      line: {
                        stroke: '#444'
                      }
                    },
                    labels: {
                      text: {
                        fill: '#fff'
                      }
                    },
                    tooltip: {
                      container: {
                        background: '#333',
                        color: '#fff'
                      }
                    }
                  }}
                />
              </div>
            </section>

            {/* Priority Distribution */}
            <section className="rounded-lg border border-neutral-700 bg-neutral-800 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-neutral-200">
                Top Active Projects
              </h2>
              {activeProjects.length > 0 ? (
                <div className="grid gap-4">
                  {activeProjects.map((project: ProjectWithStatus) => (
                    <div
                      key={project.id}
                      className="rounded-lg border border-neutral-700 bg-neutral-900 p-4 shadow-sm"
                    >
                      <h3 className="font-medium text-neutral-100">{project.name}</h3>
                      <div className="mt-2">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs ${
                            project.priority === 'high' 
                              ? 'bg-red-900/40 text-red-300' 
                              : project.priority === 'medium'
                              ? 'bg-yellow-900/40 text-yellow-300'
                              : 'bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          {project.priority || "normal"} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500">No active projects found.</p>
              )}
            </section>
          </div>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-neutral-200">Today's Tasks</h2>
            {tasks.filter((task: TaskWithDate) => 
              task.dueDate && isWithinInterval(new Date(task.dueDate), 
              { start: new Date().setHours(0,0,0,0), end: new Date().setHours(23,59,59,999) })
            ).length > 0 ? (
              <div className="grid gap-3">
                {tasks
                  .filter((task: TaskWithDate) => 
                    task.dueDate && isWithinInterval(new Date(task.dueDate), 
                    { start: new Date().setHours(0,0,0,0), end: new Date().setHours(23,59,59,999) })
                  )
                  .map((task: TaskWithDate) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-neutral-700 bg-neutral-800 p-4 shadow-sm"
                    >
                      <h3 className="font-medium text-neutral-100">{task.title}</h3>
                      {task.dueDate && (
                        <p className="mt-1 text-sm text-neutral-500">
                          Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </p>
                      )}
                      {task.status && (
                        <span className="mt-2 inline-block rounded-full bg-neutral-700 px-2 py-1 text-xs text-neutral-400">
                          {task.status.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-neutral-500">No tasks due today.</p>
            )}
          </section>
          
          {/* Project Management Layout */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-neutral-200">Project Management</h2>
            <div className="border border-neutral-700 rounded-lg p-4 min-h-[400px]">
              <ProjectLayout data={layoutData} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
