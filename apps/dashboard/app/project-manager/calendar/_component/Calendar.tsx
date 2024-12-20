// @ts-nocheck

"use client";

import { useState, useCallback } from "react";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  View,
  Views,
  NavigateAction,
} from "react-big-calendar";
import moment from "moment";
import { useRouter } from "next/navigation";
import { dummyEvents, Event } from "../data/dummyEvents";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "./calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer for BigCalendar
const localizer = momentLocalizer(moment);

const viewOptions = [
  { label: "Month", value: Views.MONTH },
  { label: "Week", value: Views.WEEK },
  { label: "Day", value: Views.DAY },
];

export default function Calendar() {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date(2024, 11, 1)); // Set initial date to December 1, 2024
  const router = useRouter();

  const handleDayDoubleClick = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    router.push(`/day/${formattedDate}`);
  };

  const eventStyleGetter = (event: Event) => {
    const style: React.CSSProperties = {
      backgroundColor: "#3182ce",
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
    };
  };

  const onNavigate = useCallback(
    (newDate: Date, view: View, action: NavigateAction) => {
      setDate(newDate);
    },
    []
  );

  const CustomToolbar = ({ onView, onNavigate, label }: any) => (
    <div className="mb-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate("PREV")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate("NEXT")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
      </div>
      <h2 className="text-xl font-semibold">{label}</h2>
      <Select value={view} onValueChange={(newView) => onView(newView as View)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select view" />
        </SelectTrigger>
        <SelectContent>
          {viewOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="h-screen w-full p-4">
      <BigCalendar
        localizer={localizer}
        events={dummyEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 2rem)" }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={onNavigate}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        onDoubleClickEvent={() => {}}
        onDoubleClickCell={({ start }) => handleDayDoubleClick(start)}
        eventPropGetter={eventStyleGetter}
        popup
        selectable
        components={{
          toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}
