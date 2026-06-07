export function TrackingNote() {
    return (
      <div
        style={{
          marginTop: 28,
          padding: "14px 18px",
          border: "0.5px solid var(--border)",
          background: "var(--card)"
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--stone)",
            marginBottom: 6
          }}
        >
          How to track
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--ink)",
            lineHeight: 1.7,
          }}
        >
          Use the tracking ID near the barcode on your label. Visit Official Website of your
          Courier Partner and track package.
        </div>
      </div>
    );
  }