/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { WarningBanner } from "./WarningBanner";

interface ImageModalProps {
  image: any;
  onClose: () => void;
}

export function ImageModal({ image, onClose }: ImageModalProps) {
  const [hasError, setHasError] = useState(false);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-inner" onClick={e => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: "0.5px solid var(--border)",
            background: "var(--card)"
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--stone)",
                marginBottom: 2
              }}
            >
              Shipment Label
            </div>
            <div
              style={{
                fontSize: 15,
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--ink)"
              }}
            >
              {image.extractedData?.name || "Your Order"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "0.5px solid var(--border)",
              color: "var(--stone)",
              width: 34,
              height: 34,
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "border-color 0.2s, color 0.2s"
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.borderColor = "var(--gold)";
              e.currentTarget.style.color = "var(--ink)";
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--stone)";
            }}
          >
            ×
          </button>
        </div>

       
        <WarningBanner/>

        <div
          style={{
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 340,
            maxHeight: "60vh",
            overflow: "hidden"
          }}
        >
          {!hasError ? (
            <img
              src={image.url}
              alt="Shipment label"
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                objectFit: "contain",
                display: "block"
              }}
              onError={() => setHasError(true)}
            />
          ) : (
            <div style={{ color: "white", padding: "20px" }}>Image failed to load</div>
          )}
        </div>

        <div
          style={{
            padding: "14px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--card)",
            borderTop: "0.5px solid var(--border)",
            flexWrap: "wrap",
            gap: 8
          }}
        >
          <div style={{ fontSize: 10, color: "var(--stone)", letterSpacing: "0.1em" }}>
            {image.extractedData?.trackingId ? (
              <>
                <span style={{ opacity: 0.5 }}>ID · </span>
                <span style={{ color: "var(--ink)" }}>{image.extractedData.trackingId}</span>
                {image.extractedData?.courier && (
                  <span style={{ opacity: 0.5 }}> · {image.extractedData.courier}</span>
                )}
              </>
            ) : (
              "Tap outside to close"
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {image.extractedData?.trackingId && (
              <a
                href={
                  image.extractedData.trackingUrl ||
                  `https://www.google.com/search?q=${encodeURIComponent(
                    image.extractedData.trackingId + " tracking"
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
                style={{ textDecoration: "none", fontSize: 10, padding: "7px 14px" }}
              >
                Track via {image.extractedData.courier || image.extractedData.trackingId} ↗
              </a>
            )}
            <button
              className="btn-ghost"
              style={{ fontSize: 10, padding: "7px 14px" }}
              onClick={async () => {
                try {
                  if (navigator.share) await navigator.share({ url: image.url });
                  else await navigator.clipboard.writeText(image.url);
                } catch {
                  /* noop */
                }
              }}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}