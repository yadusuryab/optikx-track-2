/* eslint-disable @typescript-eslint/no-explicit-any */
import { Counter } from "./Counter";
import { ImageCard } from "./ImageCard";
import { LoadingSkeleton } from "./LoadingSkelton";
import { Pagination } from "./Pagination";
import { TrackingNote } from "./TrackingNote";
import { WarningBanner } from "./WarningBanner";


interface ResultsGridProps {
  images: any[];
  loading: boolean;
  pagination: any;
  query: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onImageClick: (image: any) => void;
}

export function ResultsGrid({
  images,
  loading,
  pagination,
  query,
  currentPage,
  onPageChange,
  onImageClick
}: ResultsGridProps) {
  if (loading) return <LoadingSkeleton />;
  
  if (images.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "72px 24px",
          border: "0.5px solid var(--border)",
          animation: "scaleIn 0.3s ease"
        }}
      >
        <div
          className="display-font"
          style={{ fontSize: 48, fontWeight: 300, color: "var(--border)", marginBottom: 14 }}
        >
          ∅
        </div>
        <div
          className="display-font"
          style={{ fontSize: 24, fontWeight: 300, marginBottom: 10 }}
        >
          No packages found
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "var(--stone)",
            lineHeight: 2
          }}
        >
          Check your name or number · New orders may take 48 hours
        </div>
        <button className="btn-ghost" onClick={() => window.location.reload()} style={{ marginTop: 24 }}>
          Try again
        </button>
      </div>
    );
  }
  
  return (
    <>
      <WarningBanner />
      
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 10
        }}
      >
        <div className="result-count">
          <span className="num">
            <Counter value={pagination?.total || images.length} />
          </span>
          <span className="lbl">
            package{(pagination?.total || images.length) !== 1 ? "s" : ""} found
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--stone)",
            textTransform: "uppercase"
          }}
        >
          for &quot;{query}&quot;
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 14
        }}
      >
        {images.map((img, i) => (
          <ImageCard
            key={img._id}
            image={img}
            index={i}
            onClick={() => onImageClick(img)}
          />
        ))}
      </div>

      <TrackingNote />
      
      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.pages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}