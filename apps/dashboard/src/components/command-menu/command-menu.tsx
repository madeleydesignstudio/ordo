import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import { X } from "lucide-react";
import React from "react";

export const CommandMenu = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
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
        className="fixed inset-0 z-[99999] flex items-center justify-center"
        shouldFilter={true}
      >
        <div
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
        <div className="relative bg-neutral-800/80 w-full max-w-lg rounded-lg border border-neutral-700 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Command.Input
              className="w-full bg-transparent border-none px-4 py-3 text-neutral-300 outline-none placeholder:text-neutral-500"
              placeholder="Type a command or search..."
            />
            <button
              onClick={() => setOpen(false)}
              className="p-2 mr-2 text-neutral-400 hover:text-neutral-200 rounded-md hover:bg-neutral-700/50"
              aria-label="Close command menu"
            >
              <X size={16} />
            </button>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-neutral-500">
              No results found.
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="px-2 py-1 text-xs text-neutral-500"
            >
              <Command.Item
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-700"
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/" });
                }}
              >
                Home
              </Command.Item>
              <Command.Item
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-700"
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/" });
                }}
              >
                Project Manager
              </Command.Item>
              <Command.Separator className="my-2 h-px bg-neutral-700" />
              <Command.Item
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-300 cursor-pointer hover:bg-neutral-700"
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/" });
                }}
              >
                Settings
              </Command.Item>
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </Command>
  );
};
