import { SidebarTrigger, useSidebar } from "@ordo/ui/components/sidebar";
import { useFocus } from "@/context/focus-context";
import { CommandMenu, useCommandMenu } from "@/components/command-menu";
import { SearchIcon } from "lucide-react";

export function TopNav() {
  const { state } = useSidebar();
  const { isFocused } = useFocus();
  const { isOpen, open, close } = useCommandMenu();
  const leftPadding = state === "expanded" ? "pl-[250px]" : "pl-[85px]";
  const topPosition = isFocused ? "-top-[30px]" : "top-0";

  return (
    <>
      <nav
        className={`fixed ${topPosition} left-0 right-0 z-50 h-[30px] flex items-center transition-all duration-200 ease-linear ${leftPadding}`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <SidebarTrigger />
          </div>

          <div className="flex items-center space-x-2 pr-4">
            <button
              onClick={open}
              className="flex items-center space-x-2 px-3 py-1 text-xs rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <SearchIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Search...</span>
              <span className="text-muted-foreground font-mono text-xs hidden sm:inline">
                ⌘K
              </span>
            </button>
          </div>
        </div>
      </nav>

      <CommandMenu isOpen={isOpen} onClose={close} />
    </>
  );
}
