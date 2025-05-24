import TodayButton from "./today-button";
import WeatherDisplay from "./weather-display";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
};

interface HomeHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const HomeMainContent = ({ currentDate, onDateChange }: HomeHeaderProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(currentDate);
  selectedDate.setHours(0, 0, 0, 0);
  
  const datePrefix = selectedDate < today 
    ? "You are looking back at" 
    : selectedDate > today 
      ? "You are looking forward to" 
      : "Today, is";

  const formattedDate = currentDate.toLocaleDateString("en-US", { 
    weekday: "long",
    day: "numeric",
    month: "long"
  }).replace(/(\d+)/, (match) => {
    const day = parseInt(match);
    const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : day % 10];
    return `${day}${suffix}`;
  });

  return (
    <div className="h-full w-full p-2.5">
      <div className="flex justify-end">
        <TodayButton currentDate={currentDate} onDateChange={onDateChange} />
      </div>
      <div className=" w-3xl flex flex-col h-full mx-auto justify-center gap-2.5">
        <div className="flex flex-col gap-1 text-neutral-500 text-xs">
          <h2>{getGreeting()} Daniel Madeley</h2>
          <h3>{datePrefix} {formattedDate}</h3>
        </div>
        <div className="bg-neutral-800/50 rounded-md border border-neutral-600 h-[20%]"> 
          <div className="flex items-end justify-center gap-1">
            <span className="text-sm">
              {currentDate
                .toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                })
                .replace(/(\d+)/, (match) => {
                  const day = parseInt(match);
                  const suffix = ["th", "st", "nd", "rd"][
                    day % 10 > 3 ? 0 : day % 10
                  ];
                  return `${day}${suffix}`;
                })}
            </span>
          </div>
        </div>
        <div className="flex justify-between w-full h-[10%] gap-2.5">
          <div className="bg-neutral-800/50 rounded-md border border-neutral-600 h-full w-1/3"><WeatherDisplay /></div>
          <div className="bg-neutral-800/50 rounded-md border border-neutral-600 h-full w-1/3">News</div>
          <div className="bg-neutral-800/50 rounded-md border border-neutral-600 h-full w-1/3">Summary</div>
        </div>
      </div>
    </div>
  );
};

export default HomeMainContent;
