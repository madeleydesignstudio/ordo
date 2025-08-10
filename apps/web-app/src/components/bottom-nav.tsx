import { useSidebar } from "@ordo/ui/components/sidebar";
import { useFocus } from "@/context/focus-context";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

export function BottomNav() {
  const { state } = useSidebar();
  const { isFocused, toggleFocus } = useFocus();
  const [currentTime, setCurrentTime] = useState(new Date());

  const leftPadding = isFocused
    ? "pl-[5px]"
    : state === "expanded"
      ? "pl-[250px]"
      : "pl-[85px]";

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav
      className={`fixed bottom-0 right-0 z-50 h-[20px] flex items-center transition-[padding] duration-200 ease-linear ${leftPadding}`}
    >
      <div className="flex items-center justify-end w-full">
        <div className="flex items-center space-x-4 pr-4">
          <button
            onClick={toggleFocus}
            className="hover:bg-muted/40 p-1 rounded"
            title={isFocused ? "Exit Focus Mode (⌘F)" : "Enter Focus Mode (⌘F)"}
          >
            {isFocused ? (
              <MinimizeIcon className="h-3 w-3" />
            ) : (
              <MaximizeIcon className="h-3 w-3" />
            )}
          </button>
          <span className="text-xs text-muted-foreground">
            {format(currentTime, "eee d MMM")}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(currentTime, "h:mm a")}
          </span>
        </div>
      </div>
    </nav>
  );
}
