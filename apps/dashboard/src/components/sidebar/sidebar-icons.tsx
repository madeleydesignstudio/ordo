import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

const SidebarIcons = () => {
  return (
    <div className="flex flex-col gap-2 py-2">
      <Link to="/">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300">
                <Settings size={14} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Link>
    </div>
  );
};

export default SidebarIcons;
