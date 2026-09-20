import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { weddingData, type WeddingEvent } from "../../data/weddingData";
import { Ornament, Botanical } from "../ui/Ornament";
import { FloatingPetals } from "../ui/FloatingPetals";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BoundaryFade } from "../ui/BoundaryFade";
function EventDetails({
  event,
  reduced,
}: {
  event: WeddingEvent;
  reduced: boolean;
}) {
  const anim = (delay: number) => ({
    initial: false as const,
    transition: { duration: reduced ? 0 : 0.5, delay },
  });

  return (
    <div className="ceremony-editorial-details">
      {/* 1. Primary Schedule */}
      <motion.div
        className="ceremony-section-cluster ceremony-schedule-cluster"
        {...anim(0.1)}
      >
        <p className="ceremony-editorial-label">
          {event.scheduleLabel || "SCHEDULE"}
        </p>
        <div className="ceremony-schedule-grid">
          {event.schedule.map((item, idx) => (
            <div key={idx} className="ceremony-schedule-entry">
              {item.label && item.time ? (
                <div className="ceremony-entry-line">
                  <span className="ceremony-entry-label">{item.label}</span>
                  <span className="ceremony-entry-time">{item.time}</span>
                </div>
              ) : (
                <p className="ceremony-entry-text">
                  {item.text || item.label || item.time}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* 2. Venue */}
      <motion.div
        className="ceremony-section-cluster ceremony-venue-cluster"
        {...anim(0.18)}
      >
        <p className="ceremony-editorial-label">{event.venueLabel || "VENUE"}</p>
        <p
          className={`ceremony-venue-headline ${
            event.isMainVenueEmphasized ? "ceremony-venue-grand" : ""
          }`}
        >
          {event.venueTitle || event.venue}
        </p>
        {event.venueAddress.map((addr, idx) => (
          <p key={idx} className="ceremony-venue-addr">
            {addr}
          </p>
        ))}
      </motion.div>

      {/* 3. Barat Route (for Vivah Sanskar) */}
      {event.baratRoute && (
        <motion.div
          className="ceremony-section-cluster ceremony-barat-route"
          {...anim(0.24)}
        >
          <p className="ceremony-editorial-label">BARAT ROUTE</p>
          <div className="ceremony-barat-sequence">
            {event.baratRoute.map((stop, idx) => (
              <div key={idx} className="ceremony-route-waypoint">
                <span className="ceremony-waypoint-name">{stop}</span>
                {idx < event.baratRoute!.length - 1 && (
                  <span
                    className="ceremony-waypoint-marker"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 4. Action Links */}
      {(event.locationId || event.mapUrl) && (
        <motion.div className="event-actions" {...anim(0.28)}>
          <a
            href={
              (event.locationId &&
                weddingData.locations[event.locationId]?.googleMapsUrl) ||
              event.mapUrl
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            View location <span aria-hidden="true">↗</span>
          </a>
        </motion.div>
      )}
    </div>
  );
}
function Garlands() {
  return (
    <div className="garlands" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          style={{ height: `${[112, 157, 94, 138, 108, 172, 125, 151, 102][i]}px`, animationDelay: `-${i * 1.7}s` }}
        >
          {Array.from({ length: [6, 8, 5, 7, 6, 9, 5, 8, 6][i] }, (_, j) => (
            <i key={j} />
          ))}
        </div>
      ))}
    </div>
  );
}
export function Garden() {
  return (
    <div className="night-garden" aria-hidden="true">
      <div className="moon" />
      <svg className="light-strings" viewBox="0 0 500 300">
        <path
          d="M-20 0Q250 210 520 0M-20 65Q250 270 520 65"
          fill="none"
          stroke="#b19b66"
          strokeWidth="1"
        />
        {Array.from({ length: 19 }, (_, i) => (
          <circle
            key={i}
            cx={i * 28}
            cy={105 - Math.pow(i * 28 - 250, 2) / 600}
            r="2.5"
            fill="#ffe1a0"
          />
        ))}
      </svg>
      <Botanical className="leaf-left" />
      <Botanical className="leaf-right" />
      <div className="garden-arch" />
      <div className="lantern lantern-one" />
      <div className="lantern lantern-two" />
      <div className="garden-floor" />
    </div>
  );
}
function Ceremony({ event }: { event: WeddingEvent }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const image = element.querySelector<HTMLImageElement>(".scene-art");
      if (image) image.loading = "eager";
      observer.disconnect();
    }, { rootMargin: "900px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.25,
  });
  const y = useTransform(smooth, [0, 1], [-3, 3]);
  const foreground = useTransform(smooth, [0, 1], [22, -22]);
  const copyOpacity = useTransform(
    smooth,
    [0.08, 0.22, 0.78, 0.94],
    [reduced ? 1 : 0.5, 1, 1, reduced ? 1 : 0.5],
  );
  return (
    <section
      id={event.id}
      ref={ref}
      className={`scene ceremony ${event.id}`}
      aria-labelledby={`${event.id}-title`}
    >
      {event.id === "vivah" ? (
        <div className="chapter-entry-veil" aria-hidden="true" />
      ) : <BoundaryFade className="chapter-entry-veil" />}
      {(event.id === "mata" || event.id === "mehendi" || event.id === "vivah") && (
        <motion.img
          className="scene-art"
          style={{ y: reduced || event.id === "mata" ? 0 : y }}
          src={event.id === "mata" ? "/images/mata-portraits.webp" : event.id === "mehendi" ? "/images/mehendi-garden.webp" : `/images/${event.id}-bg.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          width={event.id === "mata" ? 785 : event.id === "mehendi" ? 876 : 1024}
          height={event.id === "mata" ? 2004 : event.id === "mehendi" ? 1796 : 1536}
          sizes="(max-width: 760px) 100vw, 760px"
          srcSet={event.id === "mata" ? "/images/mata-portraits-640.webp 640w, /images/mata-portraits.webp 785w" : event.id === "mehendi" ? "/images/mehendi-garden-640.webp 640w, /images/mehendi-garden.webp 876w" : "/images/vivah-bg-640.webp 640w, /images/vivah-bg.webp 1024w"}
        />
      )}
      {event.id === "haldi" && (
        <>
          <div className="sun-disc" />
          <div className="haveli" aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
          <Garlands />
          <Botanical className="haldi-leaf" />
          <div className="turmeric-bowl" aria-hidden="true" />
        </>
      )}
      <motion.div className="ceremony-copy" style={{ opacity: copyOpacity }}>
        <p className="eyebrow">{event.chapter}</p>
        <Ornament />

        {/* Auspicious Small Date */}
        <motion.p
          className="ceremony-full-date"
          initial={false}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          {event.fullDate}
        </motion.p>

        {/* Large Ceremony Title */}
        <motion.div
          initial={false}
          animate="visible"
        >
          <motion.h2
            id={`${event.id}-title`}
            variants={{
              hidden: { clipPath: "inset(0 0 100% 0)" },
              visible: { clipPath: "inset(0 0 0% 0)" },
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {event.title}
          </motion.h2>
        </motion.div>

        {/* Short atmospheric event line */}
        <p className="ceremony-line">{event.line}</p>

        {/* Full Ceremony Event Details */}
        <EventDetails event={event} reduced={!!reduced} />
      </motion.div>
      <motion.div
        className="foreground-decoration"
        style={{ y: reduced ? 0 : foreground }}
      >
        {event.id === "mata" ? (
          <div className="lamp-glow" />
        ) : event.id === "haldi" ? (
          <div className="marigold-bed" />
        ) : (
          <Botanical />
        )}
      </motion.div>
      <FloatingPetals gold={event.id === "mata" || event.id === "haldi"} />
      {event.id === "haldi" ? (
        <div className="chapter-bridge" aria-hidden="true" />
      ) : <BoundaryFade className="chapter-bridge" />}
    </section>
  );
}
export function CeremonyScenes() {
  return (
    <>
      {weddingData.events.map((event) => (
        <Ceremony key={event.id} event={event} />
      ))}
    </>
  );
}
