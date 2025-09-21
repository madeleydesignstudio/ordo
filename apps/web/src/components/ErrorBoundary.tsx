import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            maxWidth: "800px",
            margin: "40px auto",
            backgroundColor: "#fee",
            border: "1px solid #f66",
            borderRadius: "8px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ color: "#c33", margin: "0 0 20px 0" }}>⚠️ Something went wrong</h1>
          <p style={{ margin: "0 0 20px 0" }}>
            The application encountered an error and couldn't load properly.
          </p>
          <details style={{ marginBottom: "20px" }}>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Error Details
            </summary>
            <pre
              style={{
                backgroundColor: "#f8f8f8",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "12px",
                color: "#666",
              }}
            >
              {this.state.error?.message}
              {"\n\n"}
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007cba",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Reload Page
          </button>
          <button
            type="button"
            onClick={() => {
              // Clear IndexedDB storage
              if ("indexedDB" in window) {
                indexedDB.deleteDatabase("ordo-db");
              }
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reset & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
