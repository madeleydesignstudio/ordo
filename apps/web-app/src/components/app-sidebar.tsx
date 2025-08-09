import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@ordo/ui/components/sidebar";
import { useFocus } from "@/context/focus-context";

export function AppSidebar() {
  const { isFocused } = useFocus();
  const sidebarTransform = isFocused ? "-translate-x-full" : "";

  return (
    <div
      className={`transition-transform duration-200 ease-linear ${sidebarTransform}`}
    >
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </div>
  );
}
