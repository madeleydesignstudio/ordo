import { useElectricSync } from "../hooks/useElectricSync";
import { quickElectricTest } from "../utils/testElectricConnection";

interface ElectricSyncStatusProps {
  className?: string;
}

export function ElectricSyncStatus({ className = "" }: ElectricSyncStatusProps) {
  // Get ElectricSQL configuration from environment variables
  const electricConfig = {
    electricUrl: import.meta.env.VITE_ELECTRIC_URL || "https://api.electric-sql.cloud",
    sourceId: import.meta.env.VITE_ELECTRIC_SOURCE_ID || "",
    secret: import.meta.env.VITE_ELECTRIC_SECRET || "",
    debug: import.meta.env.DEV === true,
  };

  const syncEnabled = import.meta.env.VITE_ELECTRIC_SYNC_ENABLED === "true";
  const isConfigured = electricConfig.sourceId && electricConfig.secret;

  const {
    isInitialized,
    isLoading,
    isSyncing,
    isUpToDate,
    error,
    lastSyncTime,
    canSync,
    startSync,
    stopSync,
    restartSync,
    clearError,
  } = useElectricSync({
    config: isConfigured ? electricConfig : undefined,
    autoStart: Boolean(syncEnabled && isConfigured),
  });

  if (!syncEnabled) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "8px 12px",
          borderRadius: "6px",
          background: "#f8f9fa",
          border: "1px solid #e9ecef",
          fontSize: "14px",
          opacity: 0.6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              display: "inline-block",
              background: "#6c757d",
            }}
          ></span>
          <span style={{ fontWeight: 500, color: "#495057" }}>Electric Sync Disabled</span>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "6px",
          background: "#fff3cd",
          border: "1px solid #ffeaa7",
          fontSize: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              display: "inline-block",
              background: "#ffc107",
            }}
          ></span>
          <span style={{ fontWeight: 500, color: "#495057" }}>Electric Sync Not Configured</span>
        </div>
        <small style={{ color: "#6c757d", fontSize: "12px" }}>Set VITE_ELECTRIC_SOURCE_ID and VITE_ELECTRIC_SECRET</small>
      </div>
    );
  }

  if (!canSync) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "6px",
          background: "#f8d7da",
          border: "1px solid #f5c6cb",
          fontSize: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              display: "inline-block",
              background: "#dc3545",
            }}
          ></span>
          <span style={{ fontWeight: 500, color: "#495057" }}>Electric Sync Unavailable</span>
        </div>
        <small style={{ color: "#6c757d", fontSize: "12px" }}>PGlite instance doesn't have Electric sync extension</small>
      </div>
    );
  }

  const getSyncStatus = () => {
    if (error) {
      return {
        dotClass: "error",
        text: "Electric Sync Error",
        details: error,
      };
    }

    if (isLoading) {
      return {
        dotClass: "loading",
        text: "Initializing Electric Sync...",
      };
    }

    if (!isInitialized) {
      return {
        dotClass: "offline",
        text: "Electric Sync Stopped",
      };
    }

    if (isSyncing) {
      return {
        dotClass: "syncing",
        text: "Syncing with Electric...",
      };
    }

    if (isUpToDate) {
      return {
        dotClass: "online",
        text: "Electric Sync Up to Date",
        details: lastSyncTime ? `Last sync: ${lastSyncTime.toLocaleTimeString()}` : undefined,
      };
    }

    return {
      dotClass: "warning",
      text: "Electric Sync Connected",
      details: "Waiting for updates...",
    };
  };

  const status = getSyncStatus();

  const getDotStyle = () => {
    const baseStyle = {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      display: "inline-block" as const,
      transition: "all 0.2s ease",
    };

    switch (status.dotClass) {
      case "online":
        return { ...baseStyle, background: "#28a745", boxShadow: "0 0 4px rgba(40, 167, 69, 0.4)" };
      case "loading":
      case "syncing":
        return {
          ...baseStyle,
          background: "#007bff",
          animation: "pulse 1.5s ease-in-out infinite"
        };
      case "warning":
        return { ...baseStyle, background: "#ffc107" };
      case "error":
        return { ...baseStyle, background: "#dc3545" };
      default:
        return { ...baseStyle, background: "#6c757d" };
    }
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 12px",
        borderRadius: "6px",
        background: "#f8f9fa",
        border: "1px solid #e9ecef",
        fontSize: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
        <span style={getDotStyle()}></span>
        <div>
          <span style={{ fontWeight: 500, color: "#495057" }}>{status.text}</span>
          {status.details && (
            <small style={{ color: "#6c757d", fontSize: "12px", display: "block", marginTop: "2px" }}>
              {status.details}
            </small>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        {error && (
          <button
            type="button"
            onClick={clearError}
            title="Clear error"
            style={{
              background: "none",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "12px",
              color: "#6c757d",
            }}
          >
            ✕
          </button>
        )}

        {!isInitialized && !isLoading && (
          <button
            type="button"
            onClick={startSync}
            title="Start Electric sync"
            style={{
              background: "none",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "12px",
              color: "#28a745",
            }}
          >
            ▶
          </button>
        )}

        {isInitialized && !isLoading && (
          <>
            <button
              type="button"
              onClick={stopSync}
              title="Stop Electric sync"
              style={{
                background: "none",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "12px",
                color: "#dc3545",
              }}
            >
              ⏸
            </button>
            <button
              type="button"
              onClick={restartSync}
              title="Restart Electric sync"
              style={{
                background: "none",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "12px",
                color: "#007bff",
              }}
            >
              🔄
            </button>
          </>
        )}

        {/* Test Connection Button */}
        <button
          type="button"
          onClick={quickElectricTest}
          title="Run ElectricSQL connection test (check console)"
          style={{
            background: "none",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "12px",
            color: "#007bff",
            marginLeft: "4px",
          }}
        >
          🧪
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
