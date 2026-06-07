import { useState } from "react";

interface ImageCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  index: number;
  onClick: () => void;
}

export function ImageCard({ image, index, onClick }: ImageCardProps) {
  const [hasError, setHasError] = useState(false);
  
  return (
    <div
      className="card-img afu"
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
      onClick={onClick}
    >
      {hasError ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--cream)",
            color: "var(--stone)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}
        >
          Unavailable
        </div>
      ) : (
        <>
          <img
            src={image.url}
            alt={image.title || "Shipment"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
            }}
            onError={() => setHasError(true)}
            loading="lazy"
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent,rgba(0,0,0,0.55))",
              padding: "18px 12px 10px"
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)"
              }}
            >
              Tap to view
            </div>
          </div>
        </>
      )}
    </div>
  );
}