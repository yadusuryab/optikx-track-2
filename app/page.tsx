/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ContactCard from "@/components/ContactCard";
import { FixedSearchBar } from "@/components/tracking/FixedSearchBar";
import { Hero } from "@/components/tracking/Hero";
import { TrackingNote } from "@/components/tracking/TrackingNote";
import { WarningBanner } from "@/components/tracking/WarningBanner";
import { Button } from "@/components/ui/button";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import UnboxingPolicyBanner from "@/components/UnboxingPolicy";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, Key } from "react";

function Counter({ value }: any) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function TrackingPage() {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<Set<any>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const inputRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => inputRef.current?.focus(), 700);
  }, []);

  const validate = () => {
    if (!query.trim()) {
      setFieldError("Enter your name or phone number");
      return false;
    }
    setFieldError("");
    return true;
  };

  const fetchImages = async (page = 1) => {
    if (!validate()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "9", search: query.trim() });
      const res = await fetch(`/api/public/images?${params}`);
      const data = await res.json();
      if (data.success) {
        setImages(data.data.images);
        setPagination(data.data.pagination);
        setImageErrors(new Set());
        setCurrentPage(page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages(1);
  };

  const reset = () => {
    setQuery("");
    setImages([]);
    setSearched(false);
    setPagination(null);
    setFieldError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  const { theme } = useTheme();
  const shadowColor = theme === "dark" ? "white" : "black";
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist+Mono:wght@300;400;500&display=swap');

     

        .page-root {
          min-height: 100vh;
          font-family: 'Geist Mono', monospace;
        }

        /* ── Floating search bar ──────────────────── */
        .search-bar-fixed {
          position: fixed;
          top: 60px; /* sits just under the header */
          left: 0; right: 0;
          z-index: 40;
        
          padding: 10px 24px;
          animation: slideBarDown 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .search-bar-fixed-inner {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ── Hero search (pre-search) ─────────────── */
        .search-bar-hero {
          max-width: 480px;
          margin: 0 auto;
        }

        /* ── Shared input shell ───────────────────── */
        .search-shell {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1.5px solid var(--border);
          transition: border-color 0.2s;
          padding-bottom: 10px;
        }
        .search-shell.compact {
          border: 0.5px solid var(--border);
          border-radius: 2px;
          padding: 8px 14px;
          background: var(--card);
        }
        .search-shell:focus-within,
        .search-shell.compact:focus-within {
          border-color: var(--gold);
        }
        .search-shell label {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--stone);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .search-shell input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          color: var(--ink);
          font-family: 'Geist Mono', monospace;
          font-size: 16px; 
          letter-spacing: 0.04em;
          min-width: 0;
        }
        .search-shell.compact input { font-size: 16px; }
        .search-shell input::placeholder { color: var(--border); }

        /* ── Buttons ──────────────────────────────── */
        .btn-primary {
          background: var(--ink);
          color: var(--cream);
          border: none;
          padding: 13px 32px;
          font-family: 'Geist Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gold);
          transform: translateX(-101%);
          transition: transform 0.28s ease;
        }
        .btn-primary:hover::after { transform: translateX(0); }
        .btn-primary span { position: relative; z-index: 1; }
        .btn-primary:disabled { opacity: 0.38; cursor: not-allowed; }
        .btn-primary:disabled::after { display: none; }

        .btn-primary.compact {
          padding: 8px 20px;
          font-size: 10px;
        }

        .btn-ghost {
          background: transparent;
          border: 0.5px solid var(--border);
          color: var(--stone);
          padding: 8px 16px;
          font-family: 'Geist Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-ghost:hover { border-color: var(--gold); color: var(--ink); }

        /* ── Animations ───────────────────────────── */
        @keyframes slideBarDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-10px) rotate(120deg); }
          66%      { transform: translateY(5px) rotate(240deg); }
        }
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(201,169,110,0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(201,169,110,0); }
          100% { box-shadow: 0 0 0 0 rgba(201,169,110,0); }
        }

        .afu { animation: fadeUp 0.55s ease forwards; }
        .d1 { animation-delay: 0.1s; opacity: 0; }
        .d2 { animation-delay: 0.2s; opacity: 0; }
        .d3 { animation-delay: 0.3s; opacity: 0; }
        .d4 { animation-delay: 0.4s; opacity: 0; }
        .d5 { animation-delay: 0.5s; opacity: 0; }

        /* ── Cards ────────────────────────────────── */
        .card-img {
          background: var(--card);
          border: 0.5px solid var(--border);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.22s;
          aspect-ratio: 3/4;
          position: relative;
        }
        .card-img:hover {
          border-color: var(--gold);
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.07);
        }

        /* ── Warning ──────────────────────────────── */
        .warning-banner {
          border-left: 2px solid var(--gold);
          background: linear-gradient(90deg, rgba(201,169,110,0.06), transparent);
          padding: 14px 18px;
        }

        /* ── Modal ────────────────────────────────── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(16px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.22s ease;
        }
        .modal-inner {
          background: var(--card);
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          animation: scaleIn 0.28s cubic-bezier(0.175,0.885,0.32,1.275);
        }

        /* ── Misc ─────────────────────────────────── */
        .divider { height: 1px; background: var(--border); }
        .display-font { font-family: 'Cormorant Garamond', serif; }
        .error-msg {
          font-size: 10px; color: #c0392b;
          letter-spacing: 0.08em; margin-top: 6px;
        }
        .result-count { display: flex; align-items: baseline; gap: 8px; }
        .result-count .num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 42px; font-weight: 300; line-height: 1; color: var(--ink);
        }
        .result-count .lbl {
          font-size: 10px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--stone);
        }
        .page-num {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border: 0.5px solid var(--border);
          font-size: 11px; font-family: 'Geist Mono', monospace;
          cursor: pointer; transition: all 0.18s; background: transparent; color: var(--ink);
        }
        .page-num:hover, .page-num.active {
          background: var(--ink); color: var(--cream); border-color: var(--ink);
        }
        .page-num:disabled { opacity: 0.28; cursor: not-allowed; }

        /* ── Responsive ───────────────────────────── */
        @media (max-width: 600px) {
          .result-count .num { font-size: 28px; }
          .search-bar-fixed { top: 56px; }
        }
      `}</style>

      {/* Particles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {mounted && [...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", borderRadius: "50%",
            backgroundColor: "rgba(201,169,110,0.10)",
            width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
            left: `${(i * 19 + 7) % 100}%`, top: `${(i * 27 + 9) % 100}%`,
            animation: `float ${15 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.4}s`,
          }} />
        ))}
      </div>

      {/* ── Fixed search bar (post-search) ───────── */}
      {searched && (
       <FixedSearchBar onSubmit={handleSubmit} onReset={reset} query={query} setQuery={setQuery} loading={false} inputRef={inputRef}/>
      )}

      {/* ── Main ─────────────────────────────────── */}
      <main style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: searched ? "120px 24px 80px" : "64px 24px 80px",
        position: "relative", zIndex: 1,
        transition: "padding 0.35s ease",
      }}>

        {/* Hero + search (pre-search) */}
        {!searched && (
          <>
            {/* Hero text */}
       <Hero/>
            {/* Hero search bar */}
            <div className="afu d3 search-bar-hero" style={{ marginBottom: 16 }}>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <div className="search-shell">
                    <label>Search</label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      placeholder="YOUR PHONE NUMBER"
                      onChange={e => { setQuery(e.target.value); setFieldError(""); }}
                    />
                  </div>
                  {fieldError && <div className="error-msg">{fieldError}</div>}
                </div>
                <Button
                  type="submit"
                  disabled={loading || !query.trim()}
                  style={{ width: "100%" }}
                >
                  <span>Track Package</span>
                </Button>
              </form>
            </div>

            {/* 48h note */}
            <div className="afu d4" style={{ maxWidth: 480, margin: "0 auto 40px", textAlign: "center" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--stone)", lineHeight: 1.8 }}>
                ※ Orders appear within 48 hours of confirmation
              </div>
            </div>

            {/* Warning */}
          <UnboxingPolicyBanner/>
          <div className="my-10">
          <ContactCard/>
          </div>
          </>
        )}

        {/* ── Results ─────────────────────────────── */}
        {searched && (
          <div>

            {/* Warning above results */}
           <WarningBanner/>

            {/* Loading skeletons */}
            {loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} style={{ aspectRatio: "3/4", background: "var(--card)", border: "0.5px solid var(--border)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, transform: "translateX(-100%)", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)", animation: `shimmer 1.4s ${i * 0.08}s infinite` }} />
                  </div>
                ))}
              </div>
            )}

            {/* Results grid */}
            {!loading && images.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
                  <div className="result-count">
                    <span className="num"><Counter value={pagination?.total || images.length} /></span>
                    <span className="lbl">package{(pagination?.total || images.length) !== 1 ? "s" : ""} found</span>
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--stone)", textTransform: "uppercase" }}>
                    for &quot;{query}&quot;
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                  {images.map((img: any, i: number) => (
                    <div
                      key={img._id as Key}
                      className="card-img afu"
                      style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                      onClick={() => setSelectedImage(img)}
                    >
                      {imageErrors.has(img.url) ? (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)", color: "var(--stone)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Unavailable
                        </div>
                      ) : (
                        <>
                          <img
                            src={img.url}
                            alt={img.title || "Shipment"}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            onError={() => setImageErrors(e => new Set([...e, img.url]))}
                            loading="lazy"
                          />
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.55))", padding: "18px 12px 10px" }}>
                            <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Tap to view</div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tracking note */}
                <TrackingNote/>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 36 }}>
                    <button className="page-num" onClick={() => fetchImages(currentPage - 1)} disabled={currentPage === 1} style={{ opacity: currentPage === 1 ? 0.28 : 1 }}>←</button>
                    {[...Array(Math.min(5, pagination.pages))].map((_: any, i: number) => (
                      <button key={i} className={`page-num${currentPage === i + 1 ? " active" : ""}`} onClick={() => fetchImages(i + 1)}>{i + 1}</button>
                    ))}
                    <button className="page-num" onClick={() => fetchImages(currentPage + 1)} disabled={currentPage === pagination.pages} style={{ opacity: currentPage === pagination.pages ? 0.28 : 1 }}>→</button>
                  </div>
                )}
              </>
            )}

            {/* No results */}
            {!loading && images.length === 0 && (
              <div style={{ textAlign: "center", padding: "72px 24px", border: "0.5px solid var(--border)", animation: "scaleIn 0.3s ease" }}>
                <div className="display-font" style={{ fontSize: 48, fontWeight: 300, color: "var(--border)", marginBottom: 14 }}>∅</div>
                <div className="display-font" style={{ fontSize: 24, fontWeight: 300, marginBottom: 10 }}>No packages found</div>
                <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--stone)", lineHeight: 2 }}>
                  Check your name or number · New orders may take 48 hours
                </div>
                <button className="btn-ghost" onClick={reset} style={{ marginTop: 24 }}>Try again</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Image Modal ───────────────────────────── */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-inner" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "0.5px solid var(--border)", background: "var(--card)" }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--stone)", marginBottom: 2 }}>Shipment Label</div>
                <div style={{ fontSize: 15, fontFamily: "'Cormorant Garamond', serif", color: "var(--ink)" }}>{selectedImage.extractedData?.name || "Your Order"}</div>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                style={{ background: "transparent", border: "0.5px solid var(--border)", color: "var(--stone)", width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={(e: any) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--ink)"; }}
                onMouseLeave={(e: any) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--stone)"; }}
              >×</button>
            </div>

            {/* Warning */}
          <WarningBanner/>

            {/* Image */}
            <div style={{ background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 340, maxHeight: "60vh", overflow: "hidden" }}>
              <img src={selectedImage.url} alt="Shipment label" style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", display: "block" }} onError={() => setImageErrors(e => new Set([...e, selectedImage.url]))} />
            </div>

            {/* Footer */}
          {/* Footer */}
<div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card)", borderTop: "0.5px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
  <div style={{ fontSize: 10, color: "var(--stone)", letterSpacing: "0.1em" }}>
    {selectedImage.extractedData?.trackingId ? (
      <>
        <span style={{ opacity: 0.5 }}>ID · </span>
        <span style={{ color: "var(--ink)" }}>{selectedImage.extractedData.trackingId}</span>
        {selectedImage.extractedData?.courier && (
          <span style={{ opacity: 0.5 }}> · {selectedImage.extractedData.courier}</span>
        )}
      </>
    ) : (
      "Tap outside to close"
    )}
  </div>
  <div style={{ display: "flex", gap: 8 }}>

    {/* Only render if tracking ID exists */}
    {selectedImage.extractedData?.trackingId && (
      <a
        href={
          selectedImage.extractedData.trackingUrl ||
          `https://www.google.com/search?q=${encodeURIComponent(selectedImage.extractedData.trackingId + " tracking")}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost"
        style={{ textDecoration: "none", fontSize: 10, padding: "7px 14px" }}
      >
        Track via {selectedImage.extractedData.courier || selectedImage.extractedData.trackingId} ↗
      </a>
    )}

    <button
      className="btn-ghost"
      style={{ fontSize: 10, padding: "7px 14px" }}
      onClick={async () => {
        try {
          if (navigator.share) await navigator.share({ url: selectedImage.url });
          else await navigator.clipboard.writeText(selectedImage.url);
        } catch { /* noop */ }
      }}
    >
      Share
    </button>
  </div>
</div>
          </div>
        </div>
      )}
    </>
  );
}