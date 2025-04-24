import React from "react";

const FinanceDashboard = () => {
  return (
    <div className="h-full w-full p-2.5  flex gap-2.5">
      <div className=" w-3/4 flex flex-col justify-between h-full gap-2.5">
        <div className="h-1/4 w-full flex gap-2.5">
          <div className="bg-neutral-900 w-3/4 h-full rounded-md border border-neutral-600"></div>
          <div className="bg-neutral-900 w-1/4 h-full rounded-md border border-neutral-600"></div>
        </div>
        <div className="h-1/4 w-full flex gap-2.5">
          <div className="bg-neutral-900 w-1/2 h-full rounded-md border border-neutral-600"></div>
          <div className="bg-neutral-900 w-1/2 h-full rounded-md border border-neutral-600"></div>
        </div>
        <div className="h-1/4 w-full flex gap-2.5">
          <div className="bg-neutral-900 w-1/2 h-full rounded-md border border-neutral-600"></div>
          <div className="bg-neutral-900 w-1/2 h-full rounded-md border border-neutral-600"></div>
        </div>
        <div className="h-1/4 w-full bg-neutral-900  rounded-md border border-neutral-600">
          <div className=""></div>
        </div>
      </div>
      <div className="bg-neutral-900 w-1/4 flex flex-col justify-between h-full border border-neutral-600 rounded-md ">
        Hello
      </div>
    </div>
  );
};

export default FinanceDashboard;
