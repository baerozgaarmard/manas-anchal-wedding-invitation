import type { CSSProperties } from "react";
export function FloatingPetals({ gold = false }: { gold?: boolean }) {
  return (
    <div className={`petals ${gold ? "gold" : ""}`} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--x": `${9 + i * 12}%`,
              "--delay": `${-i * 3.1}s`,
              "--duration": `${17 + i * 2}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
