import React from "react";
import { AppSidebar } from "../sidebar/app-sidebar";
import SmallAppSideBar from "../sidebar/small-app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import ContentTabs from "./content-tabs";

const MainContentProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar />
        <SmallAppSideBar />
        <div className="flex flex-col flex-1">
          <ContentTabs>
            {children}
          </ContentTabs>
         
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainContentProvider;
