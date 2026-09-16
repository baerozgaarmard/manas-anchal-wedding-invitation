import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { countdownAt } from "../../utils/countdown";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function WeddingCountdown() {
  const [state, setState] = useState(() =>
    countdownAt(Date.now(), weddingData.wedding),
  );
  const reduced = useReducedMotion();
  useEffect(() => {
    const tick = () => setState(countdownAt(Date.now(), weddingData.wedding));
    // An unconfirmed year is an honest waiting state, never a guessed timer.
    if (state.kind === "awaiting") return;
    const timer = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [state.kind]);
  if (state.kind === "today" || state.kind === "past")
    return (
      <p className="countdown-finished" role="status">
        {state.kind === "today"
          ? weddingData.wedding.todayMessage
          : weddingData.wedding.pastMessage}
      </p>
    );
  const labels = ["Days", "Hours", "Minutes", "Seconds"] as const;
  return (
    <div className="countdown-clock">
      <div
        className="countdown-values"
        role="timer"
        aria-live="off"
        aria-label={
          state.kind === "counting"
            ? `${state.days} days, ${state.hours} hours, ${state.minutes} minutes, ${state.seconds} seconds until our wedding ${weddingData.wedding.time ? "ceremony" : "day"}`
            : "Countdown awaiting the confirmed wedding year"
        }
      >
        {labels.map((label) => {
          const value =
            state.kind === "counting"
              ? String(
                  state[
                    label.toLowerCase() as
                      "days" | "hours" | "minutes" | "seconds"
                  ],
                ).padStart(2, "0")
              : "—";
          return (
            <div className="countdown-unit" key={label}>
              <div className="number-mask" aria-hidden="true">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={value}
                    initial={reduced ? false : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduced ? undefined : { y: -8, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {value}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="countdown-label">{label}</span>
            </div>
          );
        })}
      </div>
      <p className="countdown-note">
        {state.kind === "awaiting"
          ? "The year will be announced soon."
          : weddingData.wedding.time
            ? "Counting the moments to our ceremony."
            : "Counting down to the start of our wedding day."}
      </p>
    </div>
  );
}
