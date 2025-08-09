import { SidebarTrigger, useSidebar } from "@ordo/ui/components/sidebar";
import { useFocus } from "@/context/focus-context";

export function TopNav() {
  const { state } = useSidebar();
  const { isFocused } = useFocus();
  const leftPadding = state === "expanded" ? "pl-[250px]" : "pl-[85px]";
  const topPosition = isFocused ? "-top-[30px]" : "top-0";

  return (
    <nav
      className={`fixed ${topPosition} left-0 right-0 z-50 h-[30px] flex items-center transition-all duration-200 ease-linear ${leftPadding}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
        </div>

        <div className="flex items-center space-x-2 pr-4">
          {/* Right side content */}
        </div>
      </div>
    </nav>
  );
}
