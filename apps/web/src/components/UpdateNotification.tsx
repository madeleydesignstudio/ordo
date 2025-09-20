import React from "react";
import { useAppUpdates } from "../hooks/useAppUpdates";
import { isMobileDevice, isPWAInstalled } from "../utils/mobileUpdateHelper";

interface UpdateNotificationProps {}

function UpdateNotification({}: UpdateNotificationProps) {
  const {
    showUpdatePrompt,
    updateType,
    isChecking,
    handleUpdate,
    dismissUpdate,
  } = useAppUpdates();

  const isMobile = isMobileDevice();
  const isPWA = isPWAInstalled();

  if (!showUpdatePrompt) return null;

  const isDeploymentUpdate = updateType === "deployment";

  // Mobile-specific messaging
  const getTitle = () => {
    if (isMobile && isPWA) {
      return isDeploymentUpdate ? "App Update Available!" : "PWA Update Ready";
    } else if (isMobile) {
      return isDeploymentUpdate
        ? "New Version Available!"
        : "Mobile Update Ready";
    }
    return isDeploymentUpdate ? "New Version Available!" : "App Update Ready";
  };

  const getMessage = () => {
    if (isMobile && isPWA) {
      return isDeploymentUpdate
        ? "A new version has been deployed. Tap to refresh and get the latest features. This will clear your app cache to ensure the best experience."
        : "The PWA has been updated in the background. Tap to apply the changes and restart the app.";
    } else if (isMobile) {
      return isDeploymentUpdate
        ? "A new version has been deployed. Tap to refresh your browser and get the latest features. This may take a moment on mobile."
        : "The mobile app has been updated in the background. Tap to apply the changes.";
    }
    return isDeploymentUpdate
      ? "A new version has been deployed. Refresh to get the latest features and improvements."
      : "The app has been updated in the background. Refresh to apply the changes.";
  };

  const getButtonText = () => {
    if (isMobile) {
      return isChecking ? "Refreshing..." : "Tap to Refresh";
    }
    return isChecking ? "Refreshing..." : "Refresh Now";
  };

  const getFooterText = () => {
    if (isMobile && isPWA) {
      return isDeploymentUpdate
        ? "This will clear cache and restart your PWA"
        : "Quick PWA restart to apply updates";
    } else if (isMobile) {
      return isDeploymentUpdate
        ? "This will clear cache and reload the mobile page"
        : "Quick mobile refresh to apply updates";
    }
    return isDeploymentUpdate
      ? "This will clear cache and reload the page"
      : "Quick refresh to apply updates";
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
        onClick={dismissUpdate}
      />

      {/* Popup */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          zIndex: 10000,
          maxWidth: "400px",
          width: "90%",
          padding: "24px",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: "16px", fontSize: "48px" }}>
          {isMobile && isPWA ? "📱" : isDeploymentUpdate ? "🚀" : "🔄"}
        </div>

        <h3
          style={{
            margin: "0 0 12px 0",
            color: "#1f2937",
            fontSize: isMobile ? "18px" : "20px",
            fontWeight: "bold",
          }}
        >
          {getTitle()}
        </h3>

        <p
          style={{
            margin: "0 0 24px 0",
            color: "#6b7280",
            lineHeight: "1.5",
            fontSize: isMobile ? "14px" : "16px",
          }}
        >
          {getMessage()}
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleUpdate}
            disabled={isChecking}
            style={{
              background: "#4F46E5",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: isChecking ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
              opacity: isChecking ? 0.6 : 1,
              transition: "all 0.2s",
              minWidth: "120px",
            }}
          >
            {getButtonText()}
          </button>

          <button
            onClick={dismissUpdate}
            style={{
              background: "transparent",
              color: "#6b7280",
              border: "2px solid #e5e7eb",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              transition: "all 0.2s",
              minWidth: "120px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            Later
          </button>
        </div>

        <div
          style={{
            marginTop: "16px",
            fontSize: isMobile ? "11px" : "12px",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          {getFooterText()}
          {isMobile && (
            <div style={{ marginTop: "4px", fontSize: "10px" }}>
              💡 Tip: Keep your {isPWA ? "PWA" : "mobile browser"} updated for
              the best experience
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UpdateNotification;
