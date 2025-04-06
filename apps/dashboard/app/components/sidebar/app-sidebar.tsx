import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRouterState } from "@tanstack/react-router";
import BorderBreak from "../border-break";
import PersonalLinks from "./personal-links";
import PrimaryLinks from "./primary-links";
import ProjectManagerLinks from "./project-manager-links";
import SettingsLink from "./settings-link";
import SidebarCalendar from "./sidebar-calendar";
import WorkspaceSettings from "./workspace-settings";

export function AppSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isHomeRoute = currentPath === "/"; // Keep home route as exact match
  const isProjectRoute = currentPath.startsWith("/project-manager");

  return (
    <Sidebar className="border-none ">
      <WorkspaceSettings />
      <SidebarContent className="">
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarTrigger className="h-6 w-6 text-neutral-500" />
          </div>
          <PrimaryLinks />
          <SidebarCalendar />
        </SidebarGroup>
        <BorderBreak />
        <SidebarGroup className="flex-1">
          {isHomeRoute && <PersonalLinks />}
          {isProjectRoute && <ProjectManagerLinks />}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SettingsLink />
      </SidebarFooter>
    </Sidebar>
  );
}
