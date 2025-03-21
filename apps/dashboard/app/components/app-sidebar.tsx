import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BellIcon,
  DumbbellIcon,
  Home,
  NotebookPen,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import SidebarCalendar from "./sidebar-calendar";

export function AppSidebar() {
  return (
    <Sidebar className="border-none">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h1 className="text-neutral-300 text-sm">madeleydesignstudio</h1>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="">
        <SidebarGroup className="gap-2">
          <div className="text-neutral-300 text-xs bg-neutral-950 p-1 rounded-sm border border-neutral-600 flex justify-between">
            <h2>Quick Menu</h2>
            <h3>⌘K</h3>
          </div>
          <div className="text-neutral-300 text-xs flex items-center gap-2">
            <span>
              <Home size={12} />
            </span>
            <h2>Home</h2>
          </div>
          <div className="text-neutral-300 text-xs flex items-center gap-2">
            <span>
              <BellIcon size={12} />
            </span>
            <h2>Notifications</h2>
          </div>
          <SidebarCalendar />
        </SidebarGroup>
        <div className="border-b border-neutral-600 mx-2.5" />
        <SidebarGroup className="flex-1 gap-2">
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
        </SidebarGroup>
        <SidebarGroup className="gap-2">
          <h1 className="text-neutral-300 text-xs">Quick Links</h1>
          <div className="h-[14rem] w-[14rem] border border-neutral-600 rounded-md bg-gradient-to-br from-neutral-950 to-neutral-900">
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-4 gap-4">
              <div className="border border-neutral-600 rounded-md flex items-center justify-center">
                <PlusIcon size={16} className="text-neutral-300" />
              </div>
              <div className="border border-neutral-600 rounded-md flex items-center justify-center">
                <PlusIcon size={16} className="text-neutral-300" />
              </div>
              <div className="border border-neutral-600 rounded-md flex items-center justify-center">
                <PlusIcon size={16} className="text-neutral-300" />
              </div>
              <div className="border border-neutral-600 rounded-md flex items-center justify-center">
                <PlusIcon size={16} className="text-neutral-300" />
              </div>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex gap-2 items-center text-neutral-300">
          <SettingsIcon size={12} />
          <h3 className=" text-xs ">Settings</h3>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
