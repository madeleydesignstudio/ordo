import React from "react";
import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import TimeLocationDisplay from "@/components/time-location-display";
import {
  BookUserIcon,
  FolderOpenDotIcon,
  Home,
  Wallet,
  WalletCards,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ContentTabs = () => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const getRouteTitle = () => {
    const pathParts = currentPath.split("/").filter(Boolean);

    const mainRoute = pathParts[0] || "home";
    const subRoute = pathParts[1];

    const mainTitles: Record<string, string> = {
      home: "Home",
      "project-manager": "Project Manager",
      "content-manager": "Content Manager",
      "finance-manager": "Finance Manager",
      settings: "Settings",
    };

    const mainTitle = mainTitles[mainRoute] || mainRoute;

    if (subRoute) {
      // Capitalize and replace hyphens with spaces for subRoute
      const formattedSubRoute = subRoute
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return `${mainTitle} / ${formattedSubRoute}`;
    }

    return mainTitle;
  };

  return (
    <div className="w-full h-full flex flex-col pb-2.5 pr-2.5">
      <div className="h-[30px] flex justify-between">
        <div className=" flex gap-2 items-center">
          <div className="h-full py-1">
            <Separator orientation="vertical" className="bg-neutral-600" />
          </div>
          <div className="flex gap-4 text-sm items-center">
            <Link
              to="/"
              className={
                currentPath === "/"
                  ? "text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              <Home size={14} />
            </Link>
            <Link
              to="/project-manager"
              className={
                currentPath.startsWith("/project-manager")
                  ? "text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              <FolderOpenDotIcon size={14} />
            </Link>
            <Link
              to="/content-manager"
              className={
                currentPath.startsWith("/content-manager")
                  ? "text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              <BookUserIcon size={14} />
            </Link>
            <Link
              to="/finance-manager"
              className={
                currentPath.startsWith("/finance-manager")
                  ? "text-neutral-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }
            >
              <Wallet size={14} />
            </Link>
          </div>
          <div className="h-full py-1">
            <Separator orientation="vertical" className="bg-neutral-600" />
          </div>

          <h1 className="text-neutral-500 text-xs text-center ">
            {getRouteTitle()}
          </h1>
        </div>
        <div className="flex gap-2 h-full items-center">
          <div className="h-full py-1">
            <Separator orientation="vertical" className="bg-neutral-600" />
          </div>
          <TimeLocationDisplay />
        </div>
      </div>
      <div className="flex-1 bg-neutral-800 rounded-md border border-neutral-600">
        <Outlet />
      </div>
    </div>
  );
};

export default ContentTabs;
