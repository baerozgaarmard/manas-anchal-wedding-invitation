import { useId, type CSSProperties } from "react";
export function FloatingPetals({ gold = false, count = 12 }: { gold?: boolean; count?: number }) {
  const id = useId();
  // Stable pseudo-random values keep each chapter unique without changing paths on render.
  const seed = Array.from(id).reduce((value, char) => value * 31 + char.charCodeAt(0), 7);
  const random = (index: number, channel: number) => {
    const value = Math.sin(seed + index * 127.1 + channel * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  return (
    <div className={`petals ${gold ? "gold" : ""}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--x": `${6 + random(i, 1) * 88}%`,
              "--size": `${7 + (i % 4) * 2}px`,
              "--drift": `${(random(i, 2) - 0.5) * 90}px`,
              "--sway": `${16 + random(i, 3) * 42}px`,
              "--sway-duration": `${6 + random(i, 4) * 7}s`,
              "--sway-delay": `${-random(i, 5) * 13}s`,
              "--rotation": `${random(i, 6) * 160 - 80}deg`,
              "--turn": `${12 + random(i, 7) * 32}deg`,
              "--scale": 0.85 + random(i, 8) * 0.25,
              "--alpha": 0.4 + (i % 3) * 0.12,
              "--delay": `${-random(i, 9) * 36}s`,
              "--duration": `${23 + random(i, 10) * 18}s`,
            } as CSSProperties
          }
        ><span /></i>
      ))}
    </div>
  );
}
