import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep a visible UI for users, but also log for developers.
    console.error("UI crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      const message =
        this.state.error instanceof Error
          ? this.state.error.message
          : String(this.state.error);

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#0b0b0b",
            color: "#fafaf8",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          }}
        >
          <div style={{ maxWidth: 760, width: "100%" }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
              Something crashed on this page
            </h1>
            <p style={{ opacity: 0.85, marginBottom: 14, fontSize: 13 }}>
              Open DevTools Console for the full error.
            </p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "rgba(250,250,248,0.08)",
                border: "1px solid rgba(250,250,248,0.18)",
                borderRadius: 12,
                padding: 14,
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: 14,
                background: "#fafaf8",
                color: "#111",
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

