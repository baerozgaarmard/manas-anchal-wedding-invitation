import { useEffect, useRef, useState } from "react";
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

function generateThreadPath(
  totalHeight: number,
  cycles = 8,
  amp = 6.5,
): string {
  if (totalHeight <= 0) {
    return "M 20 0 L 20 1000";
  }
  const L = totalHeight / cycles;
  const k = 4 / (3 * Math.PI); // ~0.4244 for smooth sinusoidal curve
  const C = 4 / 3; // ~1.3333
  let d = "M 20 0";
  for (let i = 0; i < cycles; i++) {
    const yStart = i * L;
    const yEnd = (i + 1) * L;
    const side = i % 2 === 0 ? -1 : 1;
    const cp1x = 20 + side * amp * C;
    const cp1y = yStart + L * k;
    const cp2x = 20 + side * amp * C;
    const cp2y = yEnd - L * k;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, 20 ${yEnd.toFixed(2)}`;
  }
  return d;
}

function findPathLengthAtY(
  pathEl: SVGPathElement,
  targetY: number,
  totalLen: number,
): number {
  let low = 0;
  let high = totalLen;
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const pt = pathEl.getPointAtLength(mid);
    if (pt.y < targetY) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

function JourneyStop({
  event,
  index,
  anchor,
  visited,
  reduced,
}: {
  event: WeddingEvent;
  index: number;
  anchor: number;
  visited: MotionValue<number>;
  reduced: boolean;
}) {
  const side = index % 2 === 0 ? 1 : -1;
  const icon = useTransform(
    visited,
    [anchor - 0.008, anchor + 0.024],
    [0.2, 1],
  );
  const draw = useTransform(
    visited,
    [anchor - 0.005, anchor + 0.035],
    [0.1, 1],
  );
  const scale = useTransform(
    visited,
    [anchor - 0.005, anchor + 0.03],
    [0.97, 1],
  );
  const x = useTransform(
    visited,
    [anchor - 0.008, anchor + 0.032],
    [side * 6, 0],
  );
  const date = useTransform(
    visited,
    [anchor - 0.008, anchor + 0.022],
    [0.25, 1],
  );
  const title = useTransform(
    visited,
    [anchor - 0.004, anchor + 0.026],
    [0.25, 1],
  );
  const fullDateAnim = useTransform(
    visited,
    [anchor, anchor + 0.032],
    [0.15, 1],
  );
  const scheduleAnim = useTransform(
    visited,
    [anchor + 0.006, anchor + 0.04],
    [0.1, 1],
  );
  const venueAnim = useTransform(
    visited,
    [anchor + 0.014, anchor + 0.048],
    [0.08, 1],
  );
  const secondaryAnim = useTransform(
    visited,
    [anchor + 0.022, anchor + 0.056],
    [0.05, 1],
  );
  const action = useTransform(
    visited,
    [anchor + 0.03, anchor + 0.065],
    [0, 1],
  );

  return (
    <div
      className={`journey-stop ${index % 2 ? "journey-left" : "journey-right"}`}
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
          {event.shortDate || event.date}
        </motion.p>
        <motion.h3 style={{ opacity: reduced ? 1 : title }}>
          <a href={`#${event.id}`}>{event.title}</a>
        </motion.h3>

        {/* Complete Event Information directly under title */}
        <div className="journey-details">
          {/* 1. Auspicious Full Date */}
          <motion.p
            className="journey-full-date"
            style={{ opacity: reduced ? 1 : fullDateAnim }}
          >
            {event.fullDate}
          </motion.p>

          {/* 2. Schedule Timings */}
          <motion.div
            className="journey-section-block"
            style={{ opacity: reduced ? 1 : scheduleAnim }}
          >
            {event.schedule.map((item, sIdx) => (
              <div key={sIdx} className="journey-schedule-item">
                {item.label && item.time ? (
                  <p className="journey-schedule-line">
                    <span>{item.label} — </span>
                    <strong>{item.time}</strong>
                  </p>
                ) : (
                  <p className="journey-schedule-line">
                    {item.text || item.label || item.time}
                  </p>
                )}
              </div>
            ))}
          </motion.div>

          {/* 3. Venue */}
          <motion.div
            className="journey-section-block"
            style={{ opacity: reduced ? 1 : venueAnim }}
          >
            <p className="journey-detail-label">{event.venueLabel || "VENUE"}</p>
            {event.venueTitle && (
              <p
                className={`journey-venue-title ${
                  event.isMainVenueEmphasized ? "journey-venue-highlight" : ""
                }`}
              >
                {event.venueTitle}
              </p>
            )}
            {event.venueAddress.map((addrLine, aIdx) => (
              <p key={aIdx} className="journey-address-line">
                {addrLine}
              </p>
            ))}
          </motion.div>

          {/* 4. Barat Route (for Vivah Sanskar) */}
          {event.baratRoute && (
            <motion.div
              className="journey-section-block"
              style={{ opacity: reduced ? 1 : secondaryAnim }}
            >
              <div className="journey-sub-block">
                <p className="journey-detail-label">BARAT ROUTE</p>
                <div className="journey-route-steps">
                  {event.baratRoute.map((stop, rIdx) => (
                    <div key={rIdx} className="journey-route-node">
                      <p className="journey-route-name">{stop}</p>
                      {rIdx < event.baratRoute!.length - 1 && (
                        <span className="journey-route-arrow" aria-hidden="true">
                          ↓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. Discover the celebration link */}
          <motion.a
            href={`#${event.id}`}
            className="journey-arrow"
            style={{ opacity: reduced ? 1 : action }}
          >
            Discover the celebration <span aria-hidden="true">↗</span>
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

export function JourneyScene() {
  const pathArea = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const reduced = !!useReducedMotion();

  const defaultHeight = 2200;
  const [pathState, setPathState] = useState({
    d: generateThreadPath(defaultHeight),
    totalHeight: defaultHeight,
    anchors: [(0 + 0.5) / 4, (1 + 0.5) / 4, (2 + 0.5) / 4, (3 + 0.5) / 4],
  });

  useEffect(() => {
    if (!pathArea.current) return;

    const measureAndSync = () => {
      if (!pathArea.current) return;
      const pathRect = pathArea.current.getBoundingClientRect();
      const stops = pathArea.current.querySelectorAll(".journey-stop");
      if (stops.length !== 4) return;

      const measuredNodes: number[] = [];

      stops.forEach((stop) => {
        const h3 = stop.querySelector("h3");
        const iconWrap = stop.querySelector(".journey-icon-wrap") as HTMLElement;

        if (h3) {
          const h3Rect = h3.getBoundingClientRect();
          const stopRect = stop.getBoundingClientRect();
          const padTop =
            parseFloat(window.getComputedStyle(stop).paddingTop) || 0;

          const relativeCenter =
            h3Rect.top - stopRect.top + h3Rect.height / 2 - padTop;

          if (iconWrap) {
            const iconH = iconWrap.offsetHeight || 76;
            iconWrap.style.marginTop = `${Math.max(
              0,
              relativeCenter - iconH / 2,
            )}px`;
          }

          const nodeY = h3Rect.top - pathRect.top + h3Rect.height / 2;
          measuredNodes.push(nodeY);
        }
      });

      const totalH = pathArea.current.offsetHeight;
      if (measuredNodes.length === 4 && totalH > 0) {
        const newD = generateThreadPath(totalH);

        let computedAnchors = [0.125, 0.375, 0.625, 0.875];
        if (path.current) {
          path.current.setAttribute("d", newD);
          const totalLen = path.current.getTotalLength();
          if (totalLen > 0) {
            computedAnchors = measuredNodes.map(
              (y) => findPathLengthAtY(path.current!, y, totalLen) / totalLen,
            );
          }
        }

        setPathState({
          d: newD,
          totalHeight: totalH,
          anchors: computedAnchors,
        });
      }
    };

    measureAndSync();

    const ro = new ResizeObserver(() => {
      measureAndSync();
    });
    ro.observe(pathArea.current);

    window.addEventListener("resize", measureAndSync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureAndSync);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: pathArea,
    offset: ["start 72%", "end 72%"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 30,
    mass: 0.1,
    restDelta: 0.0005,
  });
  const progress = useTransform(smooth, (value) =>
    reduced ? 1 : Math.max(0, Math.min(1, value)),
  );
  const visited = useMotionValue(0);
  useMotionValueEvent(progress, "change", (value) =>
    visited.set(Math.max(visited.get(), value)),
  );
  return (
    <section
      id="journey"
      className={`journey paper ${reduced ? "journey-reduced" : ""}`}
    >
      <FloatingPetals count={10} fullHeight />
      <div className="journey-top-fade" aria-hidden="true" />
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
          viewBox={`0 0 40 ${pathState.totalHeight}`}
          style={{ height: `${pathState.totalHeight}px` }}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={pathState.d} stroke="#b79a7040" />
          <motion.path
            ref={path}
            className="journey-drawn-path"
            d={pathState.d}
            stroke="#aa8551"
            style={{ pathLength: progress }}
          />
        </svg>
        {weddingData.events.map((event, index) => (
          <JourneyStop
            key={event.id}
            event={event}
            index={index}
            anchor={pathState.anchors[index] ?? (index + 0.5) / 4}
            visited={visited}
            reduced={reduced}
          />
        ))}
      </div>
      <Botanical />
      <div className="journey-bottom-fade" aria-hidden="true" />
    </section>
  );
}


import { FloatingPetals } from "../ui/FloatingPetals";
