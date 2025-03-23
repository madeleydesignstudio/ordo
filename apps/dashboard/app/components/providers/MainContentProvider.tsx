import React from "react";
import { AppSidebar } from "../sidebar/app-sidebar";
import SmallAppSideBar from "../sidebar/small-app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import ContentTabs from "./content-tabs";
import { Outlet } from "@tanstack/react-router";

const MainContentProvider = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        <AppSidebar />
        <SmallAppSideBar />
        <ContentTabs>
          <Outlet />
        </ContentTabs>
      </div>
    </SidebarProvider>
  );
};

export default MainContentProvider;
