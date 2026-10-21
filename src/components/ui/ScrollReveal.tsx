import { useRef, type ReactNode } from "react";
import { useShownOnce } from "../../hooks/useShownOnce";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** Rises and fades in once when it first comes on screen (CSS: [data-reveal="rise"]). */
export function ScrollReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const shown = useShownOnce(ref) || reduced;
  return <div ref={ref} className={className} data-reveal="rise" data-shown={shown || undefined}>{children}</div>;
}
