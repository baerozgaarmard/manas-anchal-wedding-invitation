import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { weddingData, type WeddingEvent } from "../../data/weddingData";
import { Ornament, Botanical } from "../ui/Ornament";
import { FloatingPetals } from "../ui/FloatingPetals";
import { useReducedMotion } from "../../hooks/useReducedMotion";
function EventDetails({ event }: { event: WeddingEvent }) {
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
  return (
    <>
      <p className="event-date">{event.date}</p>
      {event.time && <p>{event.time}</p>}
      {event.venue && <p className="venue">{event.venue}</p>}
      {event.address && <p className="address">{event.address}</p>}
      <div className="event-actions">
        {event.mapUrl && (
          <a href={event.mapUrl} target="_blank" rel="noreferrer">
            ↗ View location
          </a>
        )}
        {event.startsAt && event.endsAt && (
          <button onClick={calendar}>＋ Add to calendar</button>
        )}
      </div>
    </>
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
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.3 });
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
        <EventDetails event={event} />
        <p className="ceremony-line">{event.line}</p>
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
