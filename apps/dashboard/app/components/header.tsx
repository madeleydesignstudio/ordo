import { useSidebar } from "@/components/sidebar-context";
import { Menu, PanelLeftOpen, SlidersHorizontal, View } from "lucide-react";
import { useEffect, useState } from "react";
import { Command } from "cmdk";
import React from "react";
const Header = () => {
  const { toggleSidebar } = useSidebar();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Command+K (Mac) or Control+K (Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        console.log("Command palette toggled!");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [open, setOpen] = React.useState(false);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="fixed top-0 h-[30px] bg-[#FBFEFB] border-b border-[#6B9CA9] flex justify-between items-center w-full overflow-hidden">
      <div className="flex items-center justify-between w-1/8 border-r border-[#6B9CA9] h-full px-2.5">
        <div className="text-[#6B9CA9]">Ordo</div>
        <button onClick={toggleSidebar} className="text-[#6B9CA9]">
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center w-6/8 px-2.5 justify-between ">
        <h2 className="text-md font-semibold text-[#6B9CA9]">
          Project Manager
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#6B9CA9]">
            <View className="h-4 w-4" />
            <span className="text-xs ">View</span>
          </div>
          <div className="flex items-center gap-2 text-[#6B9CA9]">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-xs">Settings</span>
          </div>
        </div>
      </div>
      <div className="flex items-center w-1/8 border-l border-[#6B9CA9] h-full justify-between px-2.5 gap-2.5">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 px-2 py-0.5 text-xs border rounded border-[#6B9CA9] text-[#6B9CA9] bg-[#F8FEFA]"
        >
          <span className="font-medium">⌘K</span>
        </button>
        <div className="flex-1 flex items-center text-xs border rounded border-[#6B9CA9] text-[#6B9CA9] overflow-hidden bg-[#6B9CA9]">
          <span className="bg-[#6B9CA9] text-white px-1 flex items-center">
            DM
          </span>
          <span className="text-xs px-1 py-0.5 bg-[#F8FEFA]">
            madeleydesignstudio
          </span>
        </div>
      </div>
      <div>
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          label="Global Command Menu"
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] bg-black text-white rounded-lg shadow-lg p-4 z-50"
        >
          <Command.Input className="bg-transparent border border-gray-700 rounded p-2 mb-2 w-full text-white" />
          <Command.List className="mt-2">
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Letters">
              <Command.Item>a</Command.Item>
              <Command.Item>b</Command.Item>
              <Command.Separator />
              <Command.Item>c</Command.Item>
            </Command.Group>

            <Command.Item>Apple</Command.Item>
          </Command.List>
        </Command.Dialog>
      </div>
    </div>
  );
};

export default Header;
