import { useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "~/components/ui/sidebar";
import SettingsLink from "./settings-link";
import WorkspaceSettings from "./workspace-settings";
import { Home, BookUserIcon, Wallet, FolderOpenDotIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

const mainNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: FolderOpenDotIcon, label: "Project Manager", path: "/project-manager" },
  { icon: BookUserIcon, label: "Content Manager", path: "/content-manager" },
  { icon: Wallet, label: "Finance Manager", path: "/finance-manager" },
];

export function AppSidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <Sidebar className="border-none">
      <WorkspaceSettings />
      <SidebarContent>
        <SidebarGroup className="flex-1">
          <div className="flex flex-col gap-1 px-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SettingsLink />
      </SidebarFooter>
    </Sidebar>
  );
}
