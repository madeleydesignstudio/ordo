import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import BorderBreak from "./border-break";

const WorkspaceSettings = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-neutral-300 text-xs">madeleydesignstudio</h1>
        <SidebarTrigger />
      </div>
      <BorderBreak />
    </div>
  );
};

export default WorkspaceSettings;
