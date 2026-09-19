import type { CSSProperties } from "react";
export function FloatingPetals({ gold = false, count = 12 }: { gold?: boolean; count?: number }) {
  return (
    <div className={`petals ${gold ? "gold" : ""}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--x": `${5 + ((i * 37) % 91)}%`,
              "--size": `${7 + (i % 4) * 2}px`,
              "--drift": `${i % 2 ? -36 : 42}px`,
              "--alpha": 0.4 + (i % 3) * 0.12,
              "--delay": `${-i * 3.1}s`,
              "--duration": `${17 + i * 2}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
