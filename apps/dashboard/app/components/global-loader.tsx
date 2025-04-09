import { useEffect, useState } from "react";

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Handle initial hydration
    const handleHydration = () => {
      setIsHydrated(true);
    };

    // Check if already hydrated
    if (document.readyState === "complete") {
      setIsHydrated(true);
    } else {
      window.addEventListener("load", handleHydration);
    }

    return () => {
      window.removeEventListener("load", handleHydration);
    };
  }, []);

  // Keep loading state true until both hydration and initial data loading is complete
  useEffect(() => {
    if (isHydrated) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-12">
          <div className="absolute inset-0 size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute inset-0 size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary [animation-delay:-0.3s]" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
