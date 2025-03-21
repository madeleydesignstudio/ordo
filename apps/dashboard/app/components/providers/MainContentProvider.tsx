import React from "react";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "../app-sidebar";
import TimeLocationDisplay from "../time-location-display";
import { Link } from "@tanstack/react-router";

const MainContentProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <div className="px-1">
          <SidebarTrigger />
        </div>
        <div className=" w-full h-full pb-2.5 pr-2.5 flex flex-col">
          <div className="h-[30px] flex items-end">
            <div className=" w-1/2 h-3/4 flex justify-between text-neutral-300">
              <Link
                to="/"
                className=" w-full text-center text-sm flex justify-center items-center rounded-t-md border-t border-x border-neutral-600 bg-neutral-800 font-light"
              >
                Home
              </Link>
              <Link
                to="/project-manager"
                className=" w-full text-center text-sm flex justify-center items-center rounded-t-md border-t border-x border-neutral-600 bg-neutral-700 font-light"
              >
                Project Manager
              </Link>
              <Link
                to="/content-manager"
                className=" w-full text-center text-sm flex justify-center items-center rounded-t-md border-t border-x border-neutral-600 bg-neutral-700 font-light"
              >
                Content Manager
              </Link>
              <Link
                to="/finance-manager"
                className=" w-full text-center text-sm flex justify-center items-center rounded-t-md border-t border-x border-neutral-600 bg-neutral-700 font-light"
              >
                Finance Manager
              </Link>
            </div>
            <div className="w-1/2 h-full">
              <TimeLocationDisplay />
            </div>
          </div>
          <div className="flex-1 bg-neutral-800 rounded-tr-md rounded-bl-md rounded-br-md border border-neutral-600">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainContentProvider;
