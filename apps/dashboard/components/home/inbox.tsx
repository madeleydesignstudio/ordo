const Inbox = () => {
  return (
    <div className="w-full h-full p-2">
      <div className="border border-dashed border-[#6B9CA9] h-full w-full rounded-lg p-1">
        <div className="p-1 border border-[#6B9CA9] rounded-lg w-full h-full bg-[F8FEFA] overflow-hidden">
          <div className="p-2 font-bold text-[#6B9CA9] text-center">Inbox</div>
          <div className="flex justify-center items-center h-[calc(100%-3rem)]">
            <div className="border-x border-[#6B9CA9]/10 h-full w-2/3 flex justify-center items-center pb-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
