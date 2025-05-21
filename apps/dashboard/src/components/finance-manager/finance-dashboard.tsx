import StockNews from "./stock-news";

const FinanceDashboard = () => {
  return (
    <div className="h-full w-full p-4 flex gap-4">
      <div className="w-3/4 flex flex-col justify-between h-full gap-4">
        <div className="h-1/4 w-full flex gap-4">
          <div className="bg-neutral-900 w-3/4 h-full rounded-md border border-neutral-600"></div>
          <div className="bg-neutral-900 w-1/4 h-full rounded-md border border-neutral-600"></div>
        </div>
        <div className="h-1/4 w-full flex gap-4">
          <div className="bg-neutral-900 w-1/2 h-full rounded-md border border-neutral-600"></div>
          <div className="bg-neutral-900 w-1/2 h-full rounded-md border border-neutral-600"></div>
        </div>
        <div className="h-1/4 w-full flex gap-4">
          <div className="bg-neutral-900 w-1/2 h-full rounded-md border border-neutral-600"></div>
          <div className="bg-neutral-900 w-1/2 h-full rounded-md border border-neutral-600"></div>
        </div>
        <div className="h-1/4 w-full bg-neutral-900 rounded-md border border-neutral-600">
          <div className=""></div>
        </div>
      </div>
      <div className="bg-neutral-900 w-1/4 flex flex-col justify-between h-full border border-neutral-600 rounded-md p-4">
        <div className="text-lg font-semibold mb-4">Latest Stock News</div>
        <StockNews />
      </div>
    </div>
  );
};

export default FinanceDashboard;
