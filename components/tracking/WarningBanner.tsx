export function WarningBanner() {
    return (
      <div className="border bg-secondary px-3 py-2 text-muted-foreground" style={{ marginBottom: 32, animation: "slideDown 0.35s ease" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>⚠</span>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--ink)",
            }}
          >
            Record a <strong className="text-foreground">360° video</strong> before unboxing — required for all returns &amp;
            damage claims.
          </div>
        </div>
      </div>
    );
  }