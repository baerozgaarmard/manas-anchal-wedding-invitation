import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { ScratchCanvas } from "../interactive/ScratchCanvas";
import { Ornament, Botanical } from "../ui/Ornament";

export function ScratchRevealScene({
  revealed,
  onReveal,
}: {
  revealed: boolean;
  onReveal: () => void;
}) {
  const reduced = useReducedMotion();
  const [scratching, setScratching] = useState(false);
  const scene = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: scene,
    offset: ["start start", "end start"],
  });
  const sheetY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const gardenY = useTransform(scrollYProgress, [0, 1], [0, 38]);
  useEffect(() => {
    if (!scratching) return;
    const prevent = (event: Event) => event.preventDefault();
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
    };
  }, [scratching]);
  const [day, month] = weddingData.wedding.dateLabel.split(" ");
  return (
    <section
      id="scratch-date"
      ref={scene}
      className={`scene scratch-scene paper ${revealed ? "date-discovered" : ""} ${scratching ? "is-scratching" : ""}`}
      aria-labelledby="scratch-title"
    >
      <motion.div
        className="scratch-environment"
        style={{ y: reduced ? 0 : gardenY }}
      >
        <img src="/images/opening-bg.webp" alt="" fetchPriority="high" />
      </motion.div>
      <Botanical className="scratch-foreground" />
      <p className="eyebrow">A secret, just for you</p>
      <motion.div
        className="scratch-card-drift"
        style={{ y: revealed && !reduced ? sheetY : 0 }}
      >
        <div className="date-stationery">
          <div className="stationery-rule" />
          <Botanical className="date-floral left" />
          <Botanical className="date-floral right" />
          <Ornament />
          <p className="date-couple">
            {weddingData.couple.groom}
            <em>&</em>
            {weddingData.couple.bride}
          </p>
          <h2 id="scratch-title" className="scratch-instruction" tabIndex={-1}>
            {revealed
              ? "The day we begin forever"
              : reduced
                ? "A beautiful date awaits"
                : "Scratch to reveal our wedding date"}
          </h2>
          <div className="foil-window">
            <div className="date-beneath" aria-hidden={!revealed}>
              <p className="eyebrow">Save the date</p>
              <strong className="revealed-day">{day}</strong>
              <span className="revealed-month">{month}</span>
              {weddingData.wedding.year && (
                <span className="revealed-year">
                  {weddingData.wedding.year}
                </span>
              )}
              <p className="date-signature">
                {weddingData.couple.groom} & {weddingData.couple.bride}
              </p>
              <Ornament />
            </div>
            <ScratchCanvas
              revealed={revealed}
              onReveal={onReveal}
              onScratchingChange={setScratching}
            />
            {revealed && (
              <div className="reveal-petals" aria-hidden="true">
                {Array.from({ length: 7 }, (_, i) => (
                  <i
                    key={i}
                    style={{
                      left: `${14 + i * 12}%`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="reveal-action">
            {revealed ? (
              <>
                <p className="sr-only" role="status">
                  Our wedding date is {weddingData.wedding.dateLabel}
                  {weddingData.wedding.year
                    ? ` ${weddingData.wedding.year}`
                    : ""}
                  .
                </p>
                <a href="#countdown" className="scroll-hint reveal-continue">
                  Let the anticipation begin <span>↓</span>
                </a>
              </>
            ) : (
              <>
                <p className="scratch-help">
                  {reduced
                    ? "A little touch. A beautiful beginning."
                    : "Gently brush away the golden veil."}
                </p>
                <button
                  className="stationery-action tap-reveal"
                  onClick={onReveal}
                  aria-label="Tap to reveal our wedding date"
                >
                  {reduced ? "Tap to reveal" : "Or, reveal with a tap"}{" "}
                  <span>↗</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
      <p className="script scratch-footnote">
        Some moments are worth uncovering.
      </p>
    </section>
  );
}
