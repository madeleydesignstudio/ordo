import React, { useEffect } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import SidebarIcons from "./sidebar-icons";
import { useSidebar } from "@/components/ui/sidebar";
import BorderBreak from "../border-break";
import { Link } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { BellIcon, Search, Settings } from "lucide-react";
import { Separator } from "../ui/separator";

const SmallAppSideBar = () => {
  const { open, setOpen } = useSidebar();

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
          <SidebarTrigger className=" h-3.5 w-3.5 " />
        </div>
        <div className="pb-2 w-full ">
          <Separator orientation="horizontal" className="bg-neutral-600" />
        </div>

        <div className="gap-2 flex flex-col">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300">
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
                <div className="p-1 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300">
                  <BellIcon size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Notifications
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <SidebarIcons />
    </div>
  );
};

export default SmallAppSideBar;
