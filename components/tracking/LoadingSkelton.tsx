export function LoadingSkeleton() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 14
        }}
      >
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: "3/4",
              background: "var(--card)",
              border: "0.5px solid var(--border)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "translateX(-100%)",
                background:
                  "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)",
                animation: `shimmer 1.4s ${i * 0.08}s infinite`
              }}
            />
          </div>
        ))}
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }