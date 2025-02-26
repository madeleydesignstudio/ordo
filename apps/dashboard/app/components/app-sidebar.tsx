import { Calendar, Home, Inbox, Menu, Search, Settings } from "lucide-react";
import { useState } from "react";

// Menu items.
const leftItems = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
];

const rightItems = [
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Custom trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-md border bg-background"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Left Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-10 w-64 bg-background border-r`}
      >
        <div className="px-4 py-2 border-b">
          <h2 className="text-lg font-semibold">Left Panel</h2>
        </div>
        <div className="p-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Navigation</h3>
            <ul className="space-y-2">
              {leftItems.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.url}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-10 w-64 bg-background border-l`}
      >
        <div className="px-4 py-2 border-b">
          <h2 className="text-lg font-semibold">Right Panel</h2>
        </div>
        <div className="p-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Tools</h3>
            <ul className="space-y-2">
              {rightItems.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.url}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
