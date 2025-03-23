import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import SidebarIcons from "./sidebar-icons";
import { useSidebar } from "@/components/ui/sidebar";
import BorderBreak from "../border-break";

const SmallAppSideBar = () => {
  const { open } = useSidebar();

  if (open) return null;

  return (
    <div className="px-1 flex flex-col items-center justify-between">
      <div className="h-[30px] flex items-center">
        <SidebarTrigger className=" h-3.5 w-3.5 " />
      </div>
      <SidebarIcons />
    </div>
  );
};

export default SmallAppSideBar;
