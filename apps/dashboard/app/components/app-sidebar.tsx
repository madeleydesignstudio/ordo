import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import PersonalLinks from "./personal-links";
import PrimaryLinks from "./primary-links";
import QuickLinks from "./quick-links";
import SettingsLink from "./settings-link";
import SidebarCalendar from "./sidebar-calendar";
import { useRouter } from "@tanstack/react-router";

export function AppSidebar() {
  const router = useRouter();
  const isHomeRoute = router.state.location.pathname === "/";
  return (
    <Sidebar className="border-none">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h1 className="text-neutral-300 text-sm">madeleydesignstudio</h1>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="">
        <SidebarGroup>
          <PrimaryLinks />
          <SidebarCalendar />
        </SidebarGroup>
        <div className="border-b border-neutral-600 mx-2.5" />
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
