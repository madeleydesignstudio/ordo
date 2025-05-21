import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";

import { useDate } from "~/components/date-context";
import DateSlider from "~/components/home/date-slider";
import HomeHeader from "~/components/home/home-header";
import HomeMainContent from "~/components/home/home-main-content";
import { WelcomeDialog } from "~/components/home/welcome-dialog";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
  </div>
);

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: "/",
        },
      });
    }
    return { user: context.user };
  },
  pendingComponent: LoadingFallback,
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center h-full w-full text-red-500">
      {error instanceof Error ? error.message : "Something went wrong"}
    </div>
  ),
});

function Index() {
  const { currentDate, setCurrentDate } = useDate();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);

  useEffect(() => {
    // Check if this is the user's first visit
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
    if (!hasCompletedOnboarding) {
      setShowWelcomeDialog(true);
    }
  }, []);

  const handleWelcomeDialogClose = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setShowWelcomeDialog(false);
  };

  return (
    <div className="flex items-center justify-center h-full w-full rounded-md flex-col">
      <WelcomeDialog isOpen={showWelcomeDialog} onClose={handleWelcomeDialogClose} />
      <HomeHeader currentDate={currentDate} onDateChange={setCurrentDate} />
      <Suspense fallback={<LoadingFallback />}>
        <HomeMainContent />
      </Suspense>
      <DateSlider currentDate={currentDate} onDateChange={setCurrentDate} />
    </div>
  );
}
