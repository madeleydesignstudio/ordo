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
import { motion, AnimatePresence } from "motion/react";
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
  const isExpanded = state === "expanded";
  const sidebarTransform = isFocused ? "-translate-x-full" : "";

  return (
    <div
      className={`transition-transform duration-200 ease-linear ${sidebarTransform}`}
    >
      <Sidebar>
        <SidebarHeader>
          <div className="p-2 flex items-center justify-center">
            <motion.div
              layout
              className="flex items-center"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.6,
              }}
            >
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white font-bold text-sm">O</span>
              </motion.div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.h2
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 8 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      mass: 0.5,
                    }}
                    className="text-lg font-semibold tracking-tight overflow-hidden whitespace-nowrap"
                  >
                    Ordo
                  </motion.h2>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
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
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-6 h-6 flex items-center justify-center"
                          >
                            <item.icon className="w-6 h-6" />
                          </motion.div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.span
                                initial={{
                                  opacity: 0,
                                  width: 0,
                                  marginLeft: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  width: "auto",
                                  marginLeft: 12,
                                }}
                                exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 30,
                                  mass: 0.5,
                                }}
                                className="overflow-hidden whitespace-nowrap"
                              >
                                {item.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
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
        <SidebarFooter>
          <div className="p-2 flex items-center justify-center border-t border-sidebar-border">
            <motion.div
              layout
              className="flex items-center"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.6,
              }}
            >
              <motion.div
                className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white font-bold text-xs">W</span>
              </motion.div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 8 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      mass: 0.5,
                    }}
                    className="text-sm text-muted-foreground overflow-hidden whitespace-nowrap"
                  >
                    Workspace
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
