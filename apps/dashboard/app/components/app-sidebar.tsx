import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import SidebarCalendar from "./sidebar-calendar";

export function AppSidebar() {
  return (
    <Sidebar className="border-none">
      <SidebarHeader>
        <h1 className="text-neutral-300 text-sm">madeleydesignstudio</h1>
      </SidebarHeader>
      <SidebarContent className="">
        <SidebarGroup>
          <div className="text-neutral-300 text-sm">Quick Menu</div>
          <div className="text-neutral-300 text-sm">Home</div>
          <div className="text-neutral-300 text-sm">Notifications</div>
          <SidebarCalendar />
        </SidebarGroup>
        <div className="border-b border-neutral-600 mx-2.5" />
        <SidebarGroup>
          <div className="text-neutral-300 text-sm">Journal</div>
          <div className="text-neutral-300 text-sm">Fitness Tracker</div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="">
        <h3 className="text-neutral-300 text-xs ">Settings</h3>
      </SidebarFooter>
    </Sidebar>
  );
}
