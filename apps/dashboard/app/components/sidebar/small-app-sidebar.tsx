import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  ArrowLeft,
  BadgeAlert,
  BellIcon,
  BookCopyIcon,
  CircleCheckBig,
  FolderIcon,
  InboxIcon,
  PresentationIcon,
  Search,
  StickyNoteIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SidebarIcons from "./sidebar-icons";
import { Link } from "@tanstack/react-router";

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

  return (
    <div className="px-1 flex flex-col items-center justify-between">
      <div className="flex flex-col items-center">
        <div className="h-[30px] flex items-center">
          {/* <ArrowLeft className=" h-3.5 w-3.5 text-neutral-300" /> */}
          <SidebarTrigger className="h-3.5 w-3.5 text-neutral-300" />
        </div>
      </div>
      <div className="gap-6 flex flex-col items-center justify-center px-1">
        {currentPath.startsWith("/project-manager") ? (
          <>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/project-manager/inbox">
                    <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                      <InboxIcon size={14} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Inbox
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/project-manager/projects">
                    <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                      <FolderIcon size={14} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Projects
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/project-manager/projects">
                    <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                      <CircleCheckBig size={14} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Tasks
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/project-manager/projects">
                    <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                      <BadgeAlert size={14} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  My Issues
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/project-manager/projects">
                    <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                      <StickyNoteIcon size={14} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Notes
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/project-manager/projects">
                    <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                      <BookCopyIcon size={14} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Notebooks
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/project-manager/projects">
                    <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                      <PresentationIcon size={14} />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Canvas
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                    <Search size={14} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Quick Menu
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300 hover:scale-125">
                    <BellIcon size={14} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Notifications
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
      <SidebarIcons />
    </div>
  );
};

export default SmallAppSideBar;
