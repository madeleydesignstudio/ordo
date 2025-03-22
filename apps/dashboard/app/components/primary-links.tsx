import { BellIcon, Home } from "lucide-react";
import React from "react";

const PrimaryLinks = () => {
  return (
    <div>
      {" "}
      <div className="text-neutral-300 text-xs bg-neutral-950 p-1 rounded-sm border border-neutral-600 flex justify-between">
        <h2>Quick Menu</h2>
        <h3>⌘K</h3>
      </div>
      <div className="text-neutral-300 text-xs flex items-center gap-2">
        <span>
          <Home size={12} />
        </span>
        <h2>Home</h2>
      </div>
      <div className="text-neutral-300 text-xs flex items-center gap-2">
        <span>
          <BellIcon size={12} />
        </span>
        <h2>Notifications</h2>
      </div>
    </div>
  );
};

export default PrimaryLinks;
