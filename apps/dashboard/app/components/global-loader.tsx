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

    // Check if CSS is loaded
    const checkCSSLoaded = () => {
      const styleSheets = Array.from(document.styleSheets);
      const isCSSLoaded = styleSheets.some((sheet) => {
        try {
          return sheet.cssRules.length > 0;
        } catch (e) {
          return false;
        }
      });

      if (isCSSLoaded) {
        setIsLoading(false);
      }
    };

    // Initial check
    checkCSSLoaded();

    // Set up interval to check CSS loading
    const interval = setInterval(checkCSSLoaded, 100);

    // Cleanup
    return () => {
      window.removeEventListener("load", handleHydration);
      clearInterval(interval);
    };
  }, []);

  // Keep loading state true until both hydration and CSS loading is complete
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="flex flex-col items-center gap-4"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(255, 255, 255, 0.2)",
            borderTopColor: "#ffffff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p
          style={{
            color: "#ffffff",
            fontSize: "0.875rem",
          }}
        >
          Loading...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
