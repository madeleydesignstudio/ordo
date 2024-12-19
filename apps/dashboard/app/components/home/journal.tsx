"use client";

import TailwindEditor from "./tailwind-editor";

const Journal = () => {
  return (
    <div className="w-full h-full p-2">
      <div className="border border-dashed border-[#6B9CA9] h-full w-full rounded-lg p-1">
        <div className="border border-[#6B9CA9] rounded-lg w-full h-full bg-[F8FEFA]">
          <div className="p-2 font-bold text-[#6B9CA9]">Journal</div>
          {/* <div>
            <TailwindEditor />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Journal;
