import TodayButton from "@/components/home/today-button";
import WeatherDisplay from "@/components/home/weather-display";

const formatDate = (date: Date) => {
  const day = date.getDate();
  const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : day % 10];
  return date
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/(\d+)/, `${day}${suffix}`);
};

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

const HomeHeader = ({ currentDate, onDateChange }: HomeHeaderProps) => {
  return (
    <div className="h-[7.5%] w-full flex justify-between items-center">
      <div className="w-1/3 text-neutral-300">
        <div className="flex  gap-1 text-xs flex-col px-2.5">
          <h3>{getGreeting()}, Daniel Madeley</h3>
        </div>
      </div>
      <div className="w-1/3 text-center text-neutral-300 font-bold flex flex-col items-center justify-center gap-1">
        <div className="flex items-end justify-center gap-1">
          <span className="text-4xl">
            {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
          </span>
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
      <div className="w-1/3 flex justify-end items-center gap-2 text-neutral-300 font-light">
        <TodayButton currentDate={currentDate} onDateChange={onDateChange} />
        <WeatherDisplay />
      </div>
    </div>
  );
};

export default HomeHeader;
