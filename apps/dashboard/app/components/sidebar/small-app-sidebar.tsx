import { useSidebar } from "@/components/ui/sidebar";
import { ArrowLeft, BellIcon, Search } from "lucide-react";
import { useEffect } from "react";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SidebarIcons from "./sidebar-icons";

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
          <ArrowLeft className=" h-3.5 w-3.5 text-neutral-300" />
        </div>
      </div>
      <div className="gap-2 flex flex-col items-center justify-center">
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
      <SidebarIcons />
    </div>
  );
};

export default SmallAppSideBar;
