import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import { useRouterState } from "@tanstack/react-router";
import {
  BadgeAlert,
  BellIcon,
  BookCopyIcon,
  CircleCheckBig,
  FolderIcon,
  InboxIcon,
  LucideIcon,
  PresentationIcon,
  Search,
  StickyNoteIcon,
} from "lucide-react";
import { useEffect } from "react";

import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SidebarIcons from "./sidebar-icons";

// Define menu item types
type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

// Define route configurations
const routeConfigs: Record<string, MenuItem[]> = {
  "project-manager": [
    { icon: InboxIcon, label: "Inbox", path: "/project-manager/inbox" },
    { icon: FolderIcon, label: "Projects", path: "/project-manager/projects" },
    { icon: CircleCheckBig, label: "Tasks", path: "/project-manager/tasks" },
    {
      icon: BadgeAlert,
      label: "My Issues",
      path: "/project-manager/my-issues",
    },
    { icon: StickyNoteIcon, label: "Notes", path: "/project-manager/notes" },
    {
      icon: BookCopyIcon,
      label: "Notebooks",
      path: "/project-manager/notebooks",
    },
    {
      icon: PresentationIcon,
      label: "Canvas",
      path: "/project-manager/canvas",
    },
  ],
  "content-manager": [
    { icon: BookCopyIcon, label: "People", path: "/content-manager/people" },
    {
      icon: PresentationIcon,
      label: "Companies",
      path: "/content-manager/companies",
    },
    {
      icon: PresentationIcon,
      label: "Opportunities",
      path: "/content-manager/opportunities",
    },
    {
      icon: PresentationIcon,
      label: "Email",
      path: "/content-manager/email",
    },
    {
      icon: PresentationIcon,
      label: "Bulk Unsubscribe",
      path: "/content-manager/bulk-unsubscribe",
    },
  ],
  "finance-manager": [
    { icon: CircleCheckBig, label: "Dashboard", path: "/finance-manager" },
    { icon: InboxIcon, label: "Transactions", path: "/finance-manager" },
  ],
  default: [
    { icon: Search, label: "Quick Menu", path: "" },
    { icon: BellIcon, label: "Notifications", path: "" },
  ],
};

const SmallAppSideBar = () => {
  const { open, setOpen } = useSidebar();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Find which route configuration to use based on the current path
  const getRouteKey = () => {
    for (const key of Object.keys(routeConfigs)) {
      if (currentPath.startsWith(`/${key}`)) {
        return key;
      }
    }
    return "default";
  };

  const currentRouteKey = getRouteKey();
  const menuItems = routeConfigs[currentRouteKey];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === "m") {
        event.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  if (open) return null;

  // Render menu item with tooltip
  const renderMenuItem = (item: MenuItem, index: number) => {
    const Icon = item.icon;

    // For default items that don't have links
    if (currentRouteKey === "default") {
      return (
        <TooltipProvider key={index} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                <Icon size={14} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // For items with links
    return (
      <TooltipProvider key={index} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={item.path}>
              <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                <Icon size={14} />
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="px-1 flex flex-col items-center justify-between">
      <div className="flex flex-col items-center">
        <div className="h-[30px] flex items-center">
          <SidebarTrigger className="h-3.5 w-3.5 text-neutral-300" />
        </div>
      </div>
      <div className="gap-6 flex flex-col items-center justify-center px-1">
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </div>
      <SidebarIcons />
    </div>
  );
};

export default SmallAppSideBar;
