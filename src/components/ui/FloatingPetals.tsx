import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
export function FloatingPetals({ gold = false, count = 12, fullHeight = false }: { gold?: boolean; count?: number; fullHeight?: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const [fallDistance, setFallDistance] = useState("110vh");
  useEffect(() => {
    if (!fullHeight || !layer.current) return;
    const element = layer.current;
    const measure = () => {
      // Use the whole section, including content added after fonts/layout settle.
      setFallDistance(`${element.clientHeight * 1.1}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fullHeight]);
  useEffect(() => {
    const element = layer.current;
    if (!element || !window.IntersectionObserver) return;
    // Petals nobody can see are paused, so only on-screen chapters animate.
    const observer = new IntersectionObserver(
      ([entry]) => element.classList.toggle("is-offscreen", !entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const id = useId();
  // Stable pseudo-random values keep each chapter unique without changing paths on render.
  const seed = Array.from(id).reduce((value, char) => value * 31 + char.charCodeAt(0), 7);
  const random = (index: number, channel: number) => {
    const value = Math.sin(seed + index * 127.1 + channel * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  // Each petal gets keyframes written with its own numbers: var() inside keyframes
  // makes the browser fully restyle every petal on every frame while scrolling.
  const name = `petal-${id.replace(/[^a-z0-9]/gi, "")}`;
  const pose = (x: number, y: number, degrees: number, scale: number) =>
    `transform: translate3d(${x}px, ${y}px, 0) rotate(${degrees}deg) scale(${scale})`;
  const petals = Array.from({ length: count }, (_, i) => {
    const drift = (random(i, 2) - 0.5) * 90;
    const sway = 16 + random(i, 3) * 42;
    const rotation = random(i, 6) * 160 - 80;
    const turn = 12 + random(i, 7) * 32;
    const scale = 0.85 + random(i, 8) * 0.25;
    const alpha = 0.4 + (i % 3) * 0.12;
    return {
      style: {
        "--x": `${6 + random(i, 1) * 88}%`,
        "--size": `${7 + (i % 4) * 2}px`,
        "--sway-duration": `${6 + random(i, 4) * 7}s`,
        "--sway-delay": `${-random(i, 5) * 13}s`,
        "--delay": fullHeight
          ? `${-((i + 0.25 + random(i, 9) * 0.5) / count) * (75 + random(i, 10) * 25)}s`
          : `${-random(i, 9) * 36}s`,
        "--duration": `${fullHeight ? 75 + random(i, 10) * 25 : 23 + random(i, 10) * 18}s`,
        animationName: `${name}-fall-${i}`,
      } as CSSProperties,
      keyframes: `@keyframes ${name}-fall-${i} {
  0% { transform: translate3d(0, -20px, 0); opacity: 0; }
  10%, 90% { opacity: ${alpha}; }
  100% { transform: translate3d(${drift}px, ${fallDistance}, 0); opacity: 0; }
}
@keyframes ${name}-sway-${i} {
  0%, 100% { ${pose(sway * -0.7, 0, rotation - turn, scale)}; opacity: .85; }
  28% { ${pose(sway * 0.35, -9, rotation, scale * 0.94)}; opacity: 1; }
  54% { ${pose(sway, 3, rotation + turn, scale)}; opacity: .92; }
  78% { ${pose(sway * -0.15, -5, rotation + turn * 0.2, scale * 0.96)}; opacity: .78; }
}`,
    };
  });
  return (
    <div ref={layer} className={`petals ${gold ? "gold" : ""}`} aria-hidden="true">
      <style>{petals.map((petal) => petal.keyframes).join("\n")}</style>
      {petals.map((petal, i) => (
        <i key={i} style={petal.style}><span style={{ animationName: `${name}-sway-${i}` }} /></i>
      ))}
    </div>
  );
}
