import { Link } from "@tanstack/react-router";
import { Command } from "cmdk";
import React from "react";

export const CommandMenu = () => {
  const [open, setOpen] = React.useState(false);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      if (!open) return;
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  return (
    <Command>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="relative bg-neutral-800/80 w-full max-w-lg rounded-lg border border-neutral-700 shadow-lg backdrop-blur-xl">
          <Command.Input
            className="w-full bg-transparent border-none px-4 py-3 text-neutral-300 outline-none placeholder:text-neutral-500"
            placeholder="Type a command or search..."
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-neutral-500">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="px-2 py-1 text-xs text-neutral-500"
            >
              <Link to="/">
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-700"
                  onSelect={() => setOpen(false)}
                >
                  Home
                </Command.Item>
              </Link>
              <Link to="/project-manager">
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-700"
                  onSelect={() => setOpen(false)}
                >
                  Project Manager
                </Command.Item>
              </Link>
              <Command.Separator className="my-2 h-px bg-neutral-700" />
              <Link to="/settings">
                <Command.Item
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-700"
                  onSelect={() => setOpen(false)}
                >
                  Settings
                </Command.Item>
              </Link>
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </Command>
  );
};
