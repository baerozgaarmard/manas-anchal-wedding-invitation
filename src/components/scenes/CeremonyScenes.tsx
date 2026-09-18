import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { weddingData, type WeddingEvent } from "../../data/weddingData";
import { Ornament, Botanical } from "../ui/Ornament";
import { FloatingPetals } from "../ui/FloatingPetals";
import { useReducedMotion } from "../../hooks/useReducedMotion";
function EventDetails({
  event,
  reduced,
}: {
  event: WeddingEvent;
  reduced: boolean;
}) {
  function calendar() {
    if (!event.startsAt || !event.endsAt) return;
    const clean = (s: string) => s.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const escape = (s: string) =>
      s
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Manas Anchal//Wedding//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}-${event.startsAt}@manas-anchal`,
      `DTSTAMP:${clean(new Date().toISOString())}`,
      `DTSTART:${clean(event.startsAt)}`,
      `DTEND:${clean(event.endsAt)}`,
      `SUMMARY:${escape(event.title)}`,
      `LOCATION:${escape(event.address || event.venue || "")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/calendar" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.id}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const anim = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay },
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
              {item.note && (
                <p className="ceremony-discrepancy-note">{item.note}</p>
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

      {/* 3. Additional Details: Invited By, Dress Code, Route, Hosts */}
      <motion.div
        className="ceremony-section-cluster ceremony-additional-cluster"
        {...anim(0.26)}
      >
        {event.invitedBy && (
          <div className="ceremony-section-cluster">
            <p className="ceremony-editorial-label">INVITED BY</p>
            {event.invitedBy.map((inv, idx) => (
              <p key={idx} className="ceremony-host-item">
                {inv}
              </p>
            ))}
          </div>
        )}

        {event.dressCode && (
          <div className="ceremony-section-cluster">
            <p className="ceremony-editorial-label">DRESS CODE</p>
            <p className="ceremony-dress-main">{event.dressCode.label}</p>
            {event.dressCode.note && (
              <p className="ceremony-dress-sub">{event.dressCode.note}</p>
            )}
          </div>
        )}

        {event.baratRoute && (
          <div className="ceremony-barat-route">
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
          </div>
        )}

        {event.hostedBy && (
          <div className="ceremony-section-cluster ceremony-hosts-cluster">
            <p className="ceremony-editorial-label">HOSTED BY</p>
            <div className="ceremony-hosts-list">
              {event.hostedBy.map((host, idx) => (
                <p key={idx} className="ceremony-host-item">
                  {host}
                </p>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* 4. Action Links */}
      <motion.div className="event-actions" {...anim(0.34)}>
        {event.mapUrl && (
          <a href={event.mapUrl} target="_blank" rel="noreferrer">
            ↗ View location
          </a>
        )}
        {event.startsAt && event.endsAt && (
          <button onClick={calendar}>＋ Add to calendar</button>
        )}
      </motion.div>
    </div>
  );
}
function Garlands() {
  return (
    <div className="garlands" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          style={{ height: `${95 + (i % 3) * 43}px`, animationDelay: `-${i}s` }}
        >
          {Array.from({ length: 9 }, (_, j) => (
            <i key={j} />
          ))}
        </div>
      ))}
    </div>
  );
}
function Garden() {
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
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.15,
  });
  const y = useTransform(smooth, [0, 1], [-10, 10]);
  const foreground = useTransform(smooth, [0, 1], [22, -22]);
  return (
    <section
      id={event.id}
      ref={ref}
      className={`scene ceremony ${event.id}`}
      aria-labelledby={`${event.id}-title`}
    >
      {(event.id === "mata" || event.id === "vivah") && (
        <motion.img
          className="scene-art"
          style={{ y: reduced ? 0 : y }}
          src={`/images/${event.id}-bg.webp`}
          alt=""
          loading="lazy"
        />
      )}
      {event.id === "mehendi" && <Garden />}
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
      <div className="ceremony-copy">
        <p className="eyebrow">{event.chapter}</p>
        <Ornament />

        {/* Auspicious Small Date */}
        <motion.p
          className="ceremony-full-date"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          {event.fullDate}
        </motion.p>

        {/* Large Ceremony Title */}
        <motion.div
          initial={reduced ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
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
      </div>
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
      <span className="chapter-number">
        0{weddingData.events.indexOf(event) + 1} / THE CELEBRATIONS
      </span>
      <div className="chapter-bridge" />
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
