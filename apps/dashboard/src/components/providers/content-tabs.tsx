import { useQueryClient } from "@tanstack/react-query";
import {
  Link,
  useNavigate,
  useRouterState
} from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookUserIcon,
  Calendar,
  FolderOpenDotIcon,
  Home,
  LayoutGrid,
  LayoutList,
  PlusIcon,
  Table2,
  Wallet
} from "lucide-react";
import { useState } from "react";
import TimeLocationDisplay from "~/components/time-location-display";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

const ContentTabs = ({ children }: { children: React.ReactNode }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // State for new project
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  });

  // State for new task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "medium",
    dueDate: "",
  });

  // State for projects list (for task creation)
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );

  // Fetch projects for the task creation dropdown
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Open task modal and fetch projects
  const handleOpenTaskModal = () => {
    fetchProjects();
    setIsTaskModalOpen(true);
  };

  // Create project mutation
  const createProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsProjectModalOpen(false);
      setNewProject({ name: "", description: "" });

      // Navigate to the new project
      navigate({
        to: "/",
        params: { projectSlug: data.project.id },
      });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Create task mutation
  const createTask = async () => {
    try {
      const projectId = newTask.projectId || "1"; // Default to first project if none selected

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create task");
      }

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      setIsTaskModalOpen(false);
      setNewTask({
        title: "",
        description: "",
        projectId: "",
        priority: "medium",
        dueDate: "",
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const getRouteTitle = () => {
    const pathParts = currentPath.split("/").filter(Boolean);

    const mainRoute = pathParts[0] || "home";
    const subRoute = pathParts[1];

    const mainTitles: Record<string, string> = {
      home: "Home",
      "project-manager": "Project Manager",
      "content-manager": "Content Manager",
      "finance-manager": "Finance Manager",
      settings: "Settings",
    };

    const mainTitle = mainTitles[mainRoute] || mainRoute;

    if (subRoute) {
      // Capitalize and replace hyphens with spaces for subRoute
      const formattedSubRoute = subRoute
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return `${mainTitle} / ${formattedSubRoute}`;
    }

    return mainTitle;
  };

  return (
    <div className="w-full h-full flex flex-col pb-2.5 pr-2.5">
      <div className="h-[30px] flex justify-between">
        <div className=" flex gap-2 items-center">
          <div className="h-full py-1">
            <Separator orientation="vertical" className="bg-neutral-700" />
          </div>
          <div className="flex gap-4 items-center">
            <ArrowLeft
              className="h-3.5 w-3.5 text-neutral-500 cursor-pointer hover:text-neutral-300"
              onClick={() => window.history.back()}
            />
            <ArrowRight
              className="h-3.5 w-3.5 text-neutral-500 cursor-pointer hover:text-neutral-300"
              onClick={() => window.history.forward()}
            />
          </div>
          <div className="h-full py-1">
            <Separator orientation="vertical" className="bg-neutral-700" />
          </div>
          <div className="flex gap-4 text-sm items-center">
            <Link
              to="/"
              className={
                currentPath === "/"
                  ? "text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              <Home size={14} />
            </Link>
            <Link
              to="/"
              className={
                currentPath.startsWith("/project-manager")
                  ? "text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              <FolderOpenDotIcon size={14} />
            </Link>
            <Link
              to="/content-manager"
              className={
                currentPath.startsWith("/content-manager")
                  ? "text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              <BookUserIcon size={14} />
            </Link>
            <Link
              to="/finance-manager"
              className={
                currentPath.startsWith("/finance-manager")
                  ? "text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              <Wallet size={14} />
            </Link>
          </div>
          <div className="h-full py-1">
            <Separator orientation="vertical" className="bg-neutral-700" />
          </div>

          <h1 className="text-neutral-500 text-xs text-center ">
            {getRouteTitle()}
          </h1>
        </div>
        <div className="flex gap-2 h-full items-center">
          {currentPath.startsWith("/project-manager") && (
            <>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs text-neutral-400 hover:text-neutral-200"
                  onClick={() => setIsProjectModalOpen(true)}
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  New Project
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs text-neutral-400 hover:text-neutral-200"
                  onClick={handleOpenTaskModal}
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  New Task
                </Button>
              </div>
              <div className="h-full py-1">
                <Separator orientation="vertical" className="bg-neutral-600" />
              </div>
              <div className="flex gap-1 bg-neutral-800/50 rounded-sm p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0.5 text-neutral-400 hover:text-neutral-200"
                  title="List view"
                >
                  <LayoutList className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0.5 text-neutral-400 hover:text-neutral-200"
                  title="Kanban view"
                >
                  <LayoutGrid className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0.5 text-neutral-400 hover:text-neutral-200"
                  title="Calendar view"
                >
                  <Calendar className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0.5 text-neutral-400 hover:text-neutral-200"
                  title="Table view"
                >
                  <Table2 className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
          <div className="h-full py-1">
            <Separator orientation="vertical" className="bg-neutral-600" />
          </div>
          <TimeLocationDisplay />
        </div>
      </div>

      <div className="flex-1 bg-neutral-800/10 backdrop-blur-2xl border border-neutral-600 relative  rounded-md">
        {children}
      </div>

      {/* Create Project Modal */}
      <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={createProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">
                Project
              </Label>
              <Select
                value={newTask.projectId}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, projectId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, priority: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTask}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentTabs;
