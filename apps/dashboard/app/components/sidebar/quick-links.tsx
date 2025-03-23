import { PlusIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function QuickLinks() {
  return (
    <Accordion type="single" collapsible defaultValue="quick-links">
      <AccordionItem value="quick-links" className="border-none ">
        <AccordionContent>
          <div className="h-[14rem] w-[14rem] border border-neutral-600 rounded-md bg-gradient-to-br from-neutral-950 to-neutral-900 flex items-center justify-center mx-auto">
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-4 gap-4">
              <div className="border border-neutral-600 rounded-md flex items-center justify-center hover:bg-neutral-700/30 cursor-pointer">
                <PlusIcon size={16} className="text-neutral-300" />
              </div>
              <div className="border border-neutral-600 rounded-md flex items-center justify-center hover:bg-neutral-700/30 cursor-pointer">
                <PlusIcon size={16} className="text-neutral-300" />
              </div>
              <div className="border border-neutral-600 rounded-md flex items-center justify-center hover:bg-neutral-700/30 cursor-pointer">
                <PlusIcon size={16} className="text-neutral-300" />
              </div>
              <div className="border border-neutral-600 rounded-md flex items-center justify-center hover:bg-neutral-700/30 cursor-pointer">
                <PlusIcon size={16} className="text-neutral-300" />
              </div>
            </div>
          </div>
        </AccordionContent>
        <AccordionTrigger className="py-2 hover:no-underline">
          <span className="text-neutral-500 text-xs">Quick Links</span>
        </AccordionTrigger>
      </AccordionItem>
    </Accordion>
  );
}
