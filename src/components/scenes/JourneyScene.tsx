import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import { weddingData, type WeddingEvent } from "../../data/weddingData";
import { Botanical, Ornament } from "../ui/Ornament";
import { JourneyIcon } from "../ui/JourneyIcon";
import { useReducedMotion } from "../../hooks/useReducedMotion";

// Eight congruent curves. Nodes lie exactly on the path at equal arc-length
// fractions (1/8, 3/8, 5/8, 7/8), regardless of the rendered SVG's dimensions.
const THREAD =
  "M20 0 Q-4 60 20 120 T20 240 T20 360 T20 480 T20 600 T20 720 T20 840 T20 960";

function JourneyStop({
  event,
  index,
  progress,
  visited,
  reduced,
}: {
  event: WeddingEvent;
  index: number;
  progress: MotionValue<number>;
  visited: MotionValue<number>;
  reduced: boolean;
}) {
  const anchor = (index + 0.5) / weddingData.events.length;
  const side = index % 2 === 0 ? 1 : -1;
  const icon = useTransform(visited, [anchor, anchor + 0.055], [0.1, 1]);
  const draw = useTransform(visited, [anchor, anchor + 0.085], [0.06, 1]);
  const scale = useTransform(visited, [anchor, anchor + 0.085], [0.98, 1]);
  const x = useTransform(visited, [anchor, anchor + 0.1], [side * 10, 0]);
  const date = useTransform(
    visited,
    [anchor + 0.012, anchor + 0.055],
    [0.09, 1],
  );
  const title = useTransform(
    visited,
    [anchor + 0.022, anchor + 0.085],
    [0.09, 1],
  );
  const action = useTransform(visited, [anchor + 0.04, anchor + 0.11], [0, 1]);
  const nodeFill = useTransform(
    visited,
    [anchor - 0.003, anchor + 0.02],
    ["#f6edda", "#ac8750"],
  );
  const halo = useTransform(
    progress,
    [anchor - 0.015, anchor + 0.025, anchor + 0.18],
    [0, 0.18, 0],
  );
  return (
    <motion.a
      className={`journey-stop ${index % 2 ? "journey-left" : "journey-right"}`}
      href={`#${event.id}`}
      aria-label={`${event.date}: ${event.title}. Discover the celebration.`}
      data-anchor={anchor}
    >
      <motion.span
        className="journey-icon-wrap"
        style={{ opacity: reduced ? 1 : icon, scale: reduced ? 1 : scale }}
      >
        <JourneyIcon kind={event.id} draw={draw} />
      </motion.span>
      <motion.div className="journey-copy" style={{ x: reduced ? 0 : x }}>
        <motion.p className="eyebrow" style={{ opacity: reduced ? 1 : date }}>
          {event.date}
        </motion.p>
        <motion.h3 style={{ opacity: reduced ? 1 : title }}>
          {event.title}
        </motion.h3>
        <motion.span
          className="journey-arrow"
          style={{ opacity: reduced ? 1 : action }}
        >
          Discover the celebration <span aria-hidden="true">↗</span>
        </motion.span>
      </motion.div>
      <span className="journey-node" aria-hidden="true">
        <motion.i
          className="journey-node-halo"
          style={{ opacity: reduced ? 0 : halo }}
        />
        <motion.i
          className="journey-node-dot"
          style={{ backgroundColor: reduced ? "#ac8750" : nodeFill }}
        />
      </span>
    </motion.a>
  );
}

export function JourneyScene() {
  const pathArea = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: pathArea,
    offset: ["start 72%", "end 72%"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.3,
    restDelta: 0.0001,
  });
  const progress = useTransform(smooth, (value) =>
    reduced ? 1 : Math.max(0, Math.min(1, value)),
  );
  const visited = useMotionValue(0);
  useMotionValueEvent(progress, "change", (value) =>
    visited.set(Math.max(visited.get(), value)),
  );
  const tipX = useTransform(
    progress,
    (value) =>
      path.current?.getPointAtLength(value * path.current.getTotalLength()).x ??
      20,
  );
  const tipY = useTransform(
    progress,
    (value) =>
      path.current?.getPointAtLength(value * path.current.getTotalLength()).y ??
      0,
  );
  return (
    <section
      id="journey"
      className={`journey paper ${reduced ? "journey-reduced" : ""}`}
    >
      <motion.div
        className="journey-heading"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">Four days. Countless memories.</p>
        <h2>The celebrations</h2>
        <p className="script">A journey to forever</p>
        <Ornament />
      </motion.div>
      <div className="journey-path" ref={pathArea}>
        <svg
          className="thread-svg"
          viewBox="0 0 40 960"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={THREAD} stroke="#b79a7040" />
          <motion.path
            ref={path}
            className="journey-drawn-path"
            d={THREAD}
            stroke="#aa8551"
            style={{ pathLength: progress }}
          />
          {!reduced && (
            <>
              <motion.circle
                r="6"
                fill="#c2a16c"
                opacity=".14"
                style={{ cx: tipX, cy: tipY }}
              />
              <motion.circle
                r="1.8"
                fill="#b39158"
                style={{ cx: tipX, cy: tipY }}
              />
            </>
          )}
        </svg>
        {weddingData.events.map((event, index) => (
          <JourneyStop
            key={event.id}
            event={event}
            index={index}
            progress={progress}
            visited={visited}
            reduced={reduced}
          />
        ))}
      </div>
      <Botanical />
    </section>
  );
}

