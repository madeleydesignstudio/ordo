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
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #f3f3f3",
          borderTop: "3px solid #646cff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px",
        }}
      />
      <div style={{ color: "#666", fontSize: "16px" }}>{message}</div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
