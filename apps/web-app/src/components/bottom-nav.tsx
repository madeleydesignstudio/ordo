import { useSidebar } from "@ordo/ui/components/sidebar";
import { useFocus } from "@/context/focus-context";

export function BottomNav() {
  const { state } = useSidebar();
  const { isFocused, toggleFocus } = useFocus();
  const leftPadding = state === "expanded" ? "pl-[250px]" : "pl-[85px]";

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 h-[20px] flex items-center transition-[padding] duration-200 ease-linear ${leftPadding}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 pl-4">
          {/* Left side content */}
        </div>

        <div className="flex items-center space-x-2 pr-4">
          <button
            onClick={toggleFocus}
            className="px-3 py-1 text-xs rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {isFocused ? "Exit Focus" : "Focus"}
          </button>
        </div>
      </div>
    </nav>
  );
}
