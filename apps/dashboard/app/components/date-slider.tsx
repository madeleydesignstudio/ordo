import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const DateSlider = () => {
  const [centerDate, setCenterDate] = useState(new Date());
  const [dates, setDates] = useState<Date[]>([]);

  const updateDateRange = (center: Date) => {
    const dateArray: Date[] = [];
    for (let i = -3; i < 4; i++) {
      const date = new Date(center);
      date.setDate(center.getDate() + i);
      dateArray.push(date);
    }
    setDates(dateArray);
  };

  useEffect(() => {
    updateDateRange(centerDate);
  }, [centerDate]);

  const handlePrevious = () => {
    const newCenter = new Date(centerDate);
    newCenter.setDate(centerDate.getDate() - 1);
    setCenterDate(newCenter);
  };

  const handleNext = () => {
    const newCenter = new Date(centerDate);
    newCenter.setDate(centerDate.getDate() + 1);
    setCenterDate(newCenter);
  };

  const formatDate = (date: Date) => {
    return {
      day: date.toLocaleDateString("en-US", { weekday: "long" }),
      date: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString(),
    };
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-center items-center w-full h-full">
        {dates.map((date, index) => {
          const { day, date: dateNum, isToday } = formatDate(date);
          return (
            <div
              key={date.toISOString()}
              className={`flex flex-col w-full text-neutral-300 h-full ${
                isToday ? "bg-neutral-600" : ""
              } ${
                index === dates.length - 1 ? "" : "border-r"
              } border-neutral-600`}
            >
              <div className="flex justify-between px-1 font-bold">
                <span className="text-sm uppercase">{day}</span>
                <span className={`text-sm`}>{dateNum}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-2">
        <button onClick={handlePrevious} className=" text-neutral-400">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute bottom-2 right-3">
        <button onClick={handleNext} className=" text-neutral-400">
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DateSlider;
