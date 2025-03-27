import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
