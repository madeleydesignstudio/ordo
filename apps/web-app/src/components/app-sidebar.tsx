import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@ordo/ui/components/sidebar";
import { Separator } from "@ordo/ui/components/separator";
import { useFocus } from "@/context/focus-context";
import { Link, useLocation } from "@tanstack/react-router";
import * as React from "react";
import {
  HomeIcon,
  BellIcon,
  FolderIcon,
  BookOpenIcon,
  NotebookPenIcon,
  SettingsIcon,
} from "lucide-react";

const items = [
  {
    title: "Home",
    url: "/home",
    icon: HomeIcon,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: BellIcon,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderIcon,
  },
  {
    title: "Knowledge Base",
    url: "/knowledge",
    icon: BookOpenIcon,
  },
  {
    title: "Journal",
    url: "/journal",
    icon: NotebookPenIcon,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
];

export function AppSidebar() {
  const { isFocused } = useFocus();
  const { state } = useSidebar();
  const location = useLocation();
  const sidebarTransform = isFocused ? "-translate-x-full" : "";
  const isExpanded = state === "expanded";

  return (
    <div
      className={`transition-transform duration-200 ease-linear ${sidebarTransform}`}
    >
      <Sidebar>
        <SidebarHeader>
          <div className="p-2">
            {isExpanded && (
              <h2 className="text-lg font-semibold tracking-tight">Ordo</h2>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {isExpanded && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-[30px]">
                {items.map((item, index) => (
                  <React.Fragment key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className={`p-3 ${
                          location.pathname === item.url
                            ? "bg-sidebar-accent border border-sidebar-border"
                            : ""
                        }`}
                      >
                        <Link
                          to={item.url}
                          className={isExpanded ? "" : "justify-center"}
                        >
                          <item.icon className="w-6 h-6" />
                          {isExpanded && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {index === 1 && (
                      <div className="px-3 py-2">
                        <Separator />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </div>
  );
}
