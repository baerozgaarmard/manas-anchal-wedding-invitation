import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { WeddingCountdown } from "../interactive/WeddingCountdown";
import { ScratchCanvas } from "../interactive/ScratchCanvas";
import { Ornament, Botanical } from "../ui/Ornament";

type RevealState = "covered" | "scratching" | "revealing" | "revealed";

export function ScratchRevealScene({
  revealed,
  onReveal,
}: {
  revealed: boolean;
  onReveal: () => void;
}) {
  const reduced = useReducedMotion();
  const [scratching, setScratching] = useState(false);
  const [revealState, setRevealState] = useState<RevealState>("covered");
  const [countdownVisible, setCountdownVisible] = useState(false);
  useEffect(() => {
    if (revealed) setRevealState("revealing");
    else if (scratching) setRevealState("scratching");
  }, [revealed, scratching]);
  useEffect(() => {
    if (revealState !== "revealed") return;
    // Let the completed date composition breathe before introducing time.
    const pause = window.setTimeout(() => setCountdownVisible(true), 750);
    return () => window.clearTimeout(pause);
  }, [revealState]);
  const scene = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: scene,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 24, mass: 0.3 });
  const sheetY = useTransform(smooth, [0, 1], [0, -18]);
  const gardenY = useTransform(smooth, [0, 1], [-10, 10]);
  const [day, month] = weddingData.wedding.dateLabel.split(" ");
  return (
    <section
      id="scratch-date"
      ref={scene}
      className={`scene scratch-scene paper ${revealed ? "date-discovered" : ""} ${scratching ? "is-scratching" : ""}`}
      data-reveal-state={revealState}
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
          {revealed && (
            <motion.span
              aria-hidden="true"
              className="reveal-sequence-clock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 3.1 }}
              onAnimationComplete={() => setRevealState("revealed")}
            />
          )}
          <motion.div
            className="invitation-countdown-space"
            initial={false}
            animate={{ height: countdownVisible ? "auto" : 0 }}
            transition={{ duration: reduced ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {countdownVisible && (
              <motion.div
                id="countdown"
                className="invitation-countdown"
                initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.2 }}
                aria-labelledby="countdown-title"
              >
                <motion.div className="countdown-divider" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : 0.8 }} />
                <h3 id="countdown-title">Until we say <em>I do</em></h3>
                <WeddingCountdown />
                <motion.a href="#journey" className="scroll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 1.2, duration: 0.6 }}>
                  Continue the journey <span>↓</span>
                </motion.a>
              </motion.div>
            )}
          </motion.div>
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
