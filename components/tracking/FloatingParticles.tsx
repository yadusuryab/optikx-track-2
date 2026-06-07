/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";

export function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: 0
    }}>
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            backgroundColor: "rgba(201,169,110,0.10)",
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            left: `${(i * 19 + 7) % 100}%`,
            top: `${(i * 27 + 9) % 100}%`,
            animation: `float ${15 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.4}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(5px) rotate(240deg); }
        }
      `}</style>
    </div>
  );
}