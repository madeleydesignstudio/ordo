import { useState, useCallback, useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "@tanstack/react-router";
import { useQuickActions, useSearchState } from "@/stores";
import {
  HomeIcon,
  BellIcon,
  FolderIcon,
  BookOpenIcon,
  NotebookPenIcon,
  SettingsIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: string;
}

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const { quickActions } = useQuickActions();
  const {
    search: { query: search, results, isSearching },
    setSearchQuery,
    clearSearch,
  } = useSearchState();

  // Reset search when menu closes
  useEffect(() => {
    if (!isOpen) {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  const navigationCommands: CommandItem[] = [
    {
      id: "home",
      title: "Go to Home",
      description: "Navigate to the home page",
      icon: HomeIcon,
      action: () => {
        navigate({ to: "/home" });
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "notifications",
      title: "Go to Notifications",
      description: "View your notifications",
      icon: BellIcon,
      action: () => {
        navigate({ to: "/notifications" });
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "projects",
      title: "Go to Projects",
      description: "Manage your projects",
      icon: FolderIcon,
      action: () => {
        navigate({ to: "/projects" });
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "knowledge",
      title: "Go to Knowledge Base",
      description: "Browse documentation and articles",
      icon: BookOpenIcon,
      action: () => {
        navigate({ to: "/knowledge" });
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "journal",
      title: "Go to Journal",
      description: "Write and view journal entries",
      icon: NotebookPenIcon,
      action: () => {
        navigate({ to: "/journal" });
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "settings",
      title: "Go to Settings",
      description: "Configure your preferences",
      icon: SettingsIcon,
      action: () => {
        navigate({ to: "/settings" });
        onClose();
      },
      category: "Navigation",
    },
  ];

  // Combine navigation commands with quick actions from store
  const quickActionCommands: CommandItem[] = quickActions.map((action) => ({
    id: action.id,
    title: action.title,
    description: action.description,
    icon: SearchIcon, // Default icon, could be mapped from action.icon
    action: () => {
      navigate({ to: action.path });
      onClose();
    },
    category: "Quick Actions",
  }));

  const commands = [...navigationCommands, ...quickActionCommands];

  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(search.toLowerCase()) ||
      command.description.toLowerCase().includes(search.toLowerCase()) ||
      command.category.toLowerCase().includes(search.toLowerCase()),
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && filteredCommands.length > 0) {
        filteredCommands[selectedIndex]?.action();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1,
        );
      }
    },
    [filteredCommands, selectedIndex, onClose],
  );

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Handle escape key globally
  useHotkeys(
    "escape",
    () => {
      if (isOpen) {
        onClose();
      }
    },
    { enableOnFormTags: true },
    [isOpen],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50">
      <div
        ref={menuRef}
        className="w-full max-w-lg mx-4 bg-background border border-border rounded-lg shadow-lg"
      >
        <div className="flex items-center border-b border-border px-3">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type a command or search..."
            className="flex-1 px-3 py-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            value={search}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-sm transition-colors"
          >
            <XIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            <div className="p-2">
              {filteredCommands.map((command, index) => (
                <div
                  key={command.id}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent"
                  }`}
                  onClick={command.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <command.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{command.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {command.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {command.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <SearchIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No commands found for "{search}"
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground bg-muted/50">
          <div className="flex items-center justify-between">
            <span>↑↓ to navigate, Enter to select, Esc to close</span>
            <span>⌘K to open</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useCommandMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Add Cmd+K hotkey to open command menu
  useHotkeys(
    "meta+k",
    (event) => {
      event.preventDefault();
      toggle();
    },
    { enableOnFormTags: true },
  );

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
