import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useRouterState } from "@tanstack/react-router";
import BorderBreak from "./border-break";
import PersonalLinks from "./personal-links";
import PrimaryLinks from "./primary-links";
import { QuickLinks } from "./quick-links";
import SettingsLink from "./settings-link";
import SidebarCalendar from "./sidebar-calendar";
import WorkspaceSettings from "./workspace-settings";

export function AppSidebar() {
  const routerState = useRouterState();
  const isHomeRoute = routerState.location.pathname === "/";
  return (
    <Sidebar className="border-none">
      <SidebarHeader>
        <WorkspaceSettings />
      </SidebarHeader>
      <SidebarContent className="">
        <SidebarGroup>
          <PrimaryLinks />
          <SidebarCalendar />
        </SidebarGroup>
        <BorderBreak />
        <SidebarGroup className="flex-1">
          {isHomeRoute && <PersonalLinks />}
        </SidebarGroup>
        <SidebarGroup>
          <QuickLinks />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SettingsLink />
      </SidebarFooter>
    </Sidebar>
  );
}
