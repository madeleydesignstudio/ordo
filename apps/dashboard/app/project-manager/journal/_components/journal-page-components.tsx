"use client";

import TailwindEditor from "@/components/home/tailwind-editor";

const Journal = () => {
  return (
    <div className="w-full h-full p-2 max-w-5xl mx-auto">
      <div className=" h-full w-full rounded-lg p-1">
        <div className=" w-full h-full ">
          <div className="p-2 font-bold text-[#6B9CA9]">Journal</div>
          <div className="h-[calc(100%-2.5rem)] overflow-hidden">
            <TailwindEditor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
