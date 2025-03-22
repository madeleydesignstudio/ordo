import { PlusIcon } from "lucide-react";
import React from "react";

const QuickLinks = () => {
  return (
    <div>
      <h1 className="text-neutral-300 text-xs">Quick Links</h1>
      <div className="h-[14rem] w-[14rem] border border-neutral-600 rounded-md bg-gradient-to-br from-neutral-950 to-neutral-900 flex items-center justify-center mx-auto">
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-4 gap-4">
          <div className="border border-neutral-600 rounded-md flex items-center justify-center hover:bg-neutral-700/30 cursor-pointer">
            <PlusIcon size={16} className="text-neutral-300" />
          </div>
          <div className="border border-neutral-600 rounded-md flex items-center justify-center hover:bg-neutral-700/30 cursor-pointer">
            <PlusIcon size={16} className="text-neutral-300" />
          </div>
          <div className="border border-neutral-600 rounded-md flex items-center justify-center hover:bg-neutral-700/30 cursor-pointer">
            <PlusIcon size={16} className="text-neutral-300" />
          </div>
          <div className="border border-neutral-600 rounded-md flex items-center justify-center hover:bg-neutral-700/30 cursor-pointer">
            <PlusIcon size={16} className="text-neutral-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickLinks;
