import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function BoundaryFade({ className }: { className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Keep the seam covered; only the atmospheric intensity changes on approach.
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  return <motion.div ref={ref} className={className} style={{ opacity: reduced ? 1 : opacity }} aria-hidden="true" />;
}
