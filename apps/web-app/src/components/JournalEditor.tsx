import { useState, useMemo, Suspense } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { useJournalEntry } from "../hooks/useJournalEntry";
import { JournalContent } from "./JournalContent";
import { TodoList } from "./TodoList";
import { Header } from "./Header";
import { Loader } from "./ui/Loader";
import { ErrorBoundary } from "./ErrorBoundary";

export function JournalEditor() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const formattedDate = useMemo(
    () => format(currentDate, "yyyy-MM-dd"),
    [currentDate]
  );
  const { content, setContent, isLoading } = useJournalEntry(formattedDate);

  const navigateDay = (direction: "prev" | "next") => {
    setCurrentDate((prev) => addDays(prev, direction === "prev" ? -1 : 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formattedDisplayDate = useMemo(
    () => format(currentDate, "EEEE, MMMM d, yyyy"),
    [currentDate]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDay("prev")}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToToday}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Go to today"
                >
                  <Calendar className="w-4 h-4" />
                  Today
                </button>
              </div>

              <h1 className="text-2xl font-bold text-gray-800">
                {formattedDisplayDate}
              </h1>

              <button
                onClick={() => navigateDay("next")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next day"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <ErrorBoundary>
              <Suspense fallback={<Loader size="lg" />}>
                <JournalContent
                  content={content}
                  setContent={setContent}
                  isLoading={isLoading}
                  todos={[]}
                  onTaskClick={() => {}}
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <TodoList date={formattedDate} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
