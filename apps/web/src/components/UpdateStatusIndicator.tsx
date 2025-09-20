import React from "react";
import { useAppUpdates } from "../hooks/useAppUpdates";

interface UpdateStatusIndicatorProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

function UpdateStatusIndicator({
  position = "bottom-right",
}: UpdateStatusIndicatorProps) {
  const { isChecking, showUpdatePrompt, updateType } = useAppUpdates();

  // Don't show indicator if update prompt is already showing
  if (showUpdatePrompt) return null;

  // Only show when actively checking
  if (!isChecking) return null;

  const getPositionStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      zIndex: 1000,
      padding: "8px 12px",
      backgroundColor: "#4F46E5",
      color: "white",
      borderRadius: "20px",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      transition: "all 0.2s ease-in-out",
    };

    switch (position) {
      case "top-left":
        return { ...baseStyles, top: "16px", left: "16px" };
      case "top-right":
        return { ...baseStyles, top: "16px", right: "16px" };
      case "bottom-left":
        return { ...baseStyles, bottom: "16px", left: "16px" };
      case "bottom-right":
      default:
        return { ...baseStyles, bottom: "16px", right: "16px" };
    }
  };

  return (
    <div style={getPositionStyles()}>
      <div
        style={{
          width: "12px",
          height: "12px",
          border: "2px solid transparent",
          borderTop: "2px solid white",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <span>Checking for updates...</span>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,
        }}
      />
    </div>
  );
}

export default UpdateStatusIndicator;
