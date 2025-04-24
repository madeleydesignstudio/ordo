import React from "react";
import { AppSidebar } from "../sidebar/app-sidebar";
import SmallAppSideBar from "../sidebar/small-app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import ContentTabs from "./content-tabs";
import { Outlet } from "@tanstack/react-router";
import { Command } from "cmdk";
import { CommandMenu } from "../command-menu/command-menu";

const MainContentProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SidebarProvider>
        <div className="flex h-screen w-screen">
          <AppSidebar />
          <SmallAppSideBar />
          <ContentTabs>
            <Outlet />
          </ContentTabs>
        </div>
      </SidebarProvider>
    </>
  );
};

export default MainContentProvider;
