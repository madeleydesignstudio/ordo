import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import { useRouterState } from "@tanstack/react-router";
import {
  Home,
  BookUserIcon,
  Wallet,
  FolderOpenDotIcon,
  LucideIcon,
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

// Define main navigation items
const mainNavItems: MenuItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FolderOpenDotIcon, label: "Project Manager", path: "/project-manager" },
  { icon: BookUserIcon, label: "Content Manager", path: "/content-manager" },
  { icon: Wallet, label: "Finance Manager", path: "/finance-manager" },
];

const SmallAppSideBar = () => {
  const { open, setOpen } = useSidebar();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

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
    const isActive = currentPath === item.path;

    return (
      <TooltipProvider key={index} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={item.path}>
              <div className={`p-2 hover:bg-neutral-800 rounded-md cursor-pointer ${
                isActive ? "text-white bg-neutral-800" : "text-neutral-300"
              } hover:scale-125`}>
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
        {mainNavItems.map((item, index) => renderMenuItem(item, index))}
      </div>
      <SidebarIcons />
    </div>
  );
};

export default SmallAppSideBar;
