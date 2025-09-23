interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = "Loading..." }: LoadingFallbackProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        padding: "40px",
        fontFamily: "system-ui, sans-serif",
        gap: "20px",
      }}
    >
      <div className="pwa-loading" />
      <div style={{ color: "#666", fontSize: "16px" }}>{message}</div>
    </div>
  );
}
