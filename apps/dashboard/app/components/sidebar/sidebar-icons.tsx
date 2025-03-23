import { NotebookPen, DumbbellIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SidebarIcons = () => {
  return (
    <div className="flex flex-col gap-2 py-2">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300">
              <NotebookPen size={14} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Journal
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300">
              <DumbbellIcon size={14} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            Fitness Tracker
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SidebarIcons;
