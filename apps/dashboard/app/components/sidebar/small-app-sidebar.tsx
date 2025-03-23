import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import SidebarIcons from "./sidebar-icons";
import { useSidebar } from "@/components/ui/sidebar";

const SmallAppSideBar = () => {
  const { open } = useSidebar();

  if (open) return null;

  return (
    <div className="px-1 flex flex-col items-center">
      <SidebarTrigger />
      <SidebarIcons />
    </div>
  );
};

export default SmallAppSideBar;
