import { DumbbellIcon, NotebookPen } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const ProjectManagerLinks = () => {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
          <span>
            <NotebookPen size={12} />
          </span>
          <h2>Inbox</h2>
        </div>
        <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
          <span>
            <DumbbellIcon size={12} />
          </span>
          <h2>Projects</h2>
        </div>
        <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
          <span>
            <DumbbellIcon size={12} />
          </span>
          <h2>Tasks</h2>
        </div>
        <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
          <span>
            <DumbbellIcon size={12} />
          </span>
          <h2>My Issues</h2>
        </div>
        <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
          <span>
            <DumbbellIcon size={12} />
          </span>
          <h2>Notes</h2>
        </div>
        <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
          <span>
            <DumbbellIcon size={12} />
          </span>
          <h2>Notebooks</h2>
        </div>
        <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
          <span>
            <DumbbellIcon size={12} />
          </span>
          <h2>Canvas</h2>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerLinks;
