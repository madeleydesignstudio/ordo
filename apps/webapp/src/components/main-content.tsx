import { useSidebar } from "@ordo/ui/components/sidebar";
import { useFocus } from "@/context/focus-context";
import { useHotkeys } from "react-hotkeys-hook";
import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className = "" }: MainContentProps) {
  const { state, toggleSidebar } = useSidebar();
  const { isFocused, toggleFocus } = useFocus();

  // Add Cmd+S hotkey to toggle sidebar
  useHotkeys(
    "meta+s",
    (event) => {
      event.preventDefault();
      toggleSidebar();
    },
    { enableOnFormTags: true },
  );

  // Add Cmd+F hotkey to toggle focus mode
  useHotkeys(
    "meta+f",
    (event) => {
      event.preventDefault();
      toggleFocus();
    },
    { enableOnFormTags: true },
  );

  const leftMargin = isFocused
    ? "ml-[5px]"
    : state === "expanded"
      ? "ml-[250px]"
      : "ml-[85px]";
  const topPosition = isFocused ? "top-[5px]" : "top-[30px]";
  const bottomPosition = "bottom-[20px]";

  return (
    <main
      className={`fixed ${topPosition} ${bottomPosition} left-0 right-0 transition-all duration-200 ease-linear ${leftMargin} ${className}`}
    >
      <div className="h-full w-full bg-background border-t border-l border-b border-border rounded-tl-xl rounded-bl-xl overflow-hidden">
        <div className="h-full w-full overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </main>
  );
}
