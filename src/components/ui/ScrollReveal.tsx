import { useRef, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** Native scroll owns position; presentation follows it in either direction. */
export function ScrollReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 170, damping: 28, mass: 0.25 });
  const opacity = useTransform(progress, [0, 0.15, 0.85, 1], [0.55, 1, 1, 0.55]);
  const y = useTransform(progress, [0, 0.2, 0.8, 1], [8, 0, 0, -8]);
  return <motion.div ref={ref} className={className} style={{ opacity: reduced ? 1 : opacity, y: reduced ? 0 : y }}>{children}</motion.div>;
}
