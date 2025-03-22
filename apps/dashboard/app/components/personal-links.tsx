import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { DumbbellIcon, NotebookPen } from "lucide-react";

const PersonalLinks = () => {
  return (
    <div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="personal" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2">
            <div className="text-neutral-500 text-xs flex items-center gap-2">
              <h2>Personal</h2>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2">
              <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
                <span>
                  <NotebookPen size={12} />
                </span>
                <h2>Journal</h2>
              </div>
              <div className="text-neutral-300 text-xs flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-md cursor-pointer">
                <span>
                  <DumbbellIcon size={12} />
                </span>
                <h2>Fitness Tracker</h2>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PersonalLinks;
