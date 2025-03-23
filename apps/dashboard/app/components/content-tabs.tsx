import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import TimeLocationDisplay from "@/components/time-location-display";

const ContentTabs = ({ children }: { children: React.ReactNode }) => {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Memoize the tab routes to prevent unnecessary re-renders
  const tabbedRoutes = React.useMemo(
    () => ["/", "/project-manager", "/content-manager", "/finance-manager"],
    []
  );

  // Memoize the route check
  const shouldShowTabs = React.useMemo(
    () => tabbedRoutes.includes(currentPath),
    [currentPath, tabbedRoutes]
  );

  // Early return for non-tabbed routes with consistent styling
  if (!shouldShowTabs) {
    return (
      <div className="w-full h-full pb-2.5 pr-2.5">
        <div className="h-[30px]">
          <TimeLocationDisplay />
        </div>
        <div className="flex-1 bg-neutral-800 rounded-md border border-neutral-600">
          {children}
        </div>
      </div>
    );
  }

  // Memoize route checks to prevent unnecessary re-renders
  const routeStates = React.useMemo(
    () => ({
      isHomeRoute: currentPath === "/",
      isProjectRoute: currentPath === "/project-manager",
      isContentRoute: currentPath === "/content-manager",
      isFinanceRoute: currentPath === "/finance-manager",
    }),
    [currentPath]
  );

  return (
    <div className="w-full h-full pb-2.5 pr-2.5 flex flex-col">
      <div className="h-[30px] flex items-end">
        <div className="w-1/2 h-3/4 flex justify-between text-neutral-300">
          <Link
            to="/"
            className={`w-full text-center text-sm flex justify-center items-center rounded-t-md border-t border-x border-neutral-600 font-light
            ${routeStates.isHomeRoute ? "bg-neutral-800" : "bg-neutral-700 hover:bg-neutral-800/50"}`}
          >
            Home
          </Link>
          <Link
            to="/project-manager"
            className={`w-full text-center text-sm flex justify-center items-center rounded-t-md border-t border-x border-neutral-600 font-light
            ${routeStates.isProjectRoute ? "bg-neutral-800" : "bg-neutral-700 hover:bg-neutral-800/50"}`}
          >
            Project Manager
          </Link>
          <Link
            to="/content-manager"
            className={`w-full text-center text-sm flex justify-center items-center rounded-t-md border-t border-x border-neutral-600 font-light
            ${routeStates.isContentRoute ? "bg-neutral-800" : "bg-neutral-700 hover:bg-neutral-800/50"}`}
          >
            Content Manager
          </Link>
          <Link
            to="/finance-manager"
            className={`w-full text-center text-sm flex justify-center items-center rounded-t-md border-t border-x border-neutral-600 font-light
            ${routeStates.isFinanceRoute ? "bg-neutral-800" : "bg-neutral-700 hover:bg-neutral-800/50"}`}
          >
            Finance Manager
          </Link>
        </div>
        <div className="w-1/2 h-full">
          <TimeLocationDisplay />
        </div>
      </div>
      <div className="flex-1 bg-neutral-800 rounded-tr-md rounded-bl-md rounded-br-md border border-neutral-600">
        {children}
      </div>
    </div>
  );
};

export default ContentTabs;
