import { useSidebar } from "@/components/sidebar-context";
import { Calendar, Check, Inbox, PanelLeftClose, Search } from "lucide-react";

// Menu items.
const leftItems = [
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Today",
    url: "/today",
    icon: Calendar,
  },
  {
    title: "Upcoming",
    url: "/upcoming",
    icon: Calendar,
  },
  {
    title: "Completed",
    url: "/completed",
    icon: Check,
  },
];

const rightItems = [
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
];

export function AppSidebar() {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <>
      {/* Left Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-10 w-1/8 bg-[#F1FCF4] border-r border-[#6B9CA9]`}
      >
        <div className="px-2.5 h-[30px] border-b flex justify-between items-center border-b-[#6B9CA9]">
          <h2 className="text-lg font-semibold text-[#6B9CA9]">Ordo</h2>
          <button onClick={toggleSidebar} aria-label="Close sidebar">
            <PanelLeftClose className="h-4 w-4 text-[#6B9CA9]" />
          </button>
        </div>
        <div className="p-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Add Task</h3>
            <ul className="space-y-2">
              {leftItems.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.url}
                    className="flex items-center gap-3 rounded-md "
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-10 w-1/8 bg-[#F1FCF4] border-l border-[#6B9CA9] h-full`}
      >
        <div className="flex items-center border-b border-[#6B9CA9] h-[30px] justify-between px-2.5 gap-2.5">
          <button className="flex items-center gap-1 px-2 py-0.5 text-xs border rounded border-[#6B9CA9] text-[#6B9CA9] bg-[#F8FEFA]">
            <span className="font-medium">⌘K</span>
          </button>
          <div className="flex-1 flex items-center text-xs border rounded border-[#6B9CA9] text-[#6B9CA9] overflow-hidden bg-[#6B9CA9]">
            <span className="bg-[#6B9CA9] text-white px-1 flex items-center">
              DM
            </span>
            <span className="text-xs px-1 py-0.5 bg-[#F8FEFA]">
              madeleydesignstudio.
            </span>
          </div>
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
