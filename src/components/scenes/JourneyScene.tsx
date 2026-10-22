import { useCallback, useEffect, useRef, useState } from "react";
import { useShownOnce } from "../../hooks/useShownOnce";
import { weddingData, type WeddingEvent } from "../../data/weddingData";
import { Botanical, Ornament, LINK_ARROW } from "../ui/Ornament";
import { JourneyIcon } from "../ui/JourneyIcon";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BoundaryFade } from "../ui/BoundaryFade";
import { ScrollReveal } from "../ui/ScrollReveal";

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
  reduced,
  onShown,
}: {
  event: WeddingEvent;
  index: number;
  reduced: boolean;
  onShown: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Shown when it reaches 72% down the screen, where the scrolled thread used to reach it.
  const shown = useShownOnce(ref, "0px 0px -28% 0px") || reduced;
  useEffect(() => {
    if (shown) onShown(index);
  }, [shown, index, onShown]);

  return (
    <div
      ref={ref}
      className={`journey-stop ${index % 2 ? "journey-left" : "journey-right"}`}
      data-reveal="stop"
      data-shown={shown || undefined}
    >
      <span className="journey-icon-wrap">
        <JourneyIcon kind={event.id} />
      </span>
      <div className="journey-copy">
        <p className="eyebrow">{event.shortDate || event.date}</p>
        <h3>
          <a href={`#${event.id}`}>{event.title}</a>
        </h3>

        {/* Complete Event Information directly under title */}
        <div className="journey-details">
          {/* 1. Auspicious Full Date */}
          <p className="journey-full-date">{event.fullDate}</p>

          {/* 2. Schedule Timings */}
          <div className="journey-section-block journey-schedule-block">
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
          </div>

          {/* 3. Venue */}
          <div className="journey-section-block journey-venue-block">
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
          </div>

          {/* 4. Barat Route (for Vivah Sanskar) */}
          {event.baratRoute && (
            <div className="journey-section-block journey-route-block">
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
            </div>
          )}

          {/* 5. Discover the celebration link */}
          <a href={`#${event.id}`} className="journey-arrow">
            Discover the celebration <span aria-hidden="true">{LINK_ARROW}</span>
          </a>
        </div>
      </div>
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

    // No window resize listener: phones fire it whenever the address bar moves mid-scroll.
    return () => ro.disconnect();
  }, []);

  const [reached, setReached] = useState(-1);
  const onShown = useCallback((index: number) => setReached((r) => Math.max(r, index)), []);
  const { anchors } = pathState;
  // Draw the thread just past the furthest stop shown, and to the end with the last one.
  const drawn = reduced
    ? 1
    : reached < 0
      ? 0
      : reached >= anchors.length - 1
        ? 1
        : Math.min(1, (anchors[reached] ?? 0) + 0.03);
  return (
    <section
      id="journey"
      className={`journey paper ${reduced ? "journey-reduced" : ""}`}
    >
      <FloatingPetals count={10} fullHeight />
      <BoundaryFade className="journey-top-fade" />
      <ScrollReveal
        className="journey-heading"
      >
        <p className="eyebrow">Four days. Countless memories.</p>
        <h2>The celebrations</h2>
        <p className="script">A journey to forever</p>
        <Ornament />
      </ScrollReveal>
      <div className="journey-path" ref={pathArea}>
        <svg
          className="thread-svg"
          viewBox={`0 0 40 ${pathState.totalHeight}`}
          style={{ height: `${pathState.totalHeight}px` }}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={pathState.d} stroke="#b79a7040" />
          <path
            ref={path}
            className="journey-drawn-path"
            d={pathState.d}
            stroke="#aa8551"
            pathLength={1}
            style={{ strokeDashoffset: 1 - drawn }}
          />
        </svg>
        {weddingData.events.map((event, index) => (
          <JourneyStop
            key={event.id}
            event={event}
            index={index}
            reduced={reduced}
            onShown={onShown}
          />
        ))}
      </div>
      <Botanical />
      <BoundaryFade className="journey-bottom-fade" />
    </section>
  );
}


import { FloatingPetals } from "../ui/FloatingPetals";
