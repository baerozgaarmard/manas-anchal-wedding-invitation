import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { Ornament, Botanical } from "../ui/Ornament";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export type EnvelopeState =
  "sealed" | "breaking" | "opening" | "revealing" | "opened";
const ease = [0.22, 1, 0.36, 1] as const;
export function EnvelopeScene({
  children,
  onOpened,
}: {
  children: ReactNode;
  onOpened: () => void;
}) {
  const [state, setState] = useState<EnvelopeState>("sealed");
  const phase = useRef<EnvelopeState>("sealed");
  const reduced = useReducedMotion();
  function advance(from: EnvelopeState, to: EnvelopeState) {
    if (phase.current !== from) return;
    phase.current = to;
    setState(to);
  }
  function finish() {
    if (phase.current === "opened") return;
    phase.current = "opened";
    setState("opened");
    onOpened();
  }
  function open() {
    if (phase.current !== "sealed") return;
    if (reduced) {
      finish();
      return;
    }
    advance("sealed", "breaking");
  }
  useEffect(() => {
    if (state === "opened") return;
    const html = document.documentElement,
      body = document.body;
    const previousHtml = html.style.overflow,
      previousBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const prevent = (event: TouchEvent) => event.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
      document.removeEventListener("touchmove", prevent);
    };
  }, [state === "opened"]);
  useEffect(() => {
    if (state === "opened")
      document.getElementById("scratch-title")?.focus({ preventScroll: true });
  }, [state]);
  const lifting = state === "revealing" || state === "opened";
  const flapOpen = state === "opening" || lifting;
  return (
    <div
      id="envelope"
      className={`letter-chapter letter-${state}`}
      data-envelope-state={state}
    >
      {state !== "opened" && (
        <button className="skip-link" onClick={finish}>
          Skip animation and open invitation
        </button>
      )}
      <motion.div
        className="letter-content"
        inert={state !== "opened"}
        aria-hidden={state !== "opened"}
        initial={false}
        animate={{
          y: lifting ? 0 : 90,
          scale: lifting ? 1 : 0.92,
          opacity: state === "sealed" || state === "breaking" ? 0 : 1,
        }}
        transition={{ duration: reduced ? 0 : 1.5, ease }}
        onAnimationComplete={() => {
          if (phase.current === "revealing") finish();
        }}
      >
        {children}
      </motion.div>
      {state !== "opened" && (
        <>
          <motion.div
            className="letter-back paper"
            animate={{ y: lifting ? "110%" : "0%" }}
            transition={{ duration: 1.4, ease }}
            aria-hidden="true"
          >
            <div className="letter-border" />
            <Botanical className="letter-botanical left" />
            <Botanical className="letter-botanical right" />
            <Ornament className="letter-bottom-ornament" />
          </motion.div>
          <motion.div
            className="letter-front paper"
            animate={{ y: lifting ? "110%" : "0%", rotateX: flapOpen ? 8 : 0 }}
            transition={{ duration: 1.35, ease }}
            aria-hidden="true"
          />
          <motion.div
            className="letter-side left paper"
            animate={{
              x: lifting ? "-110%" : flapOpen ? "-3%" : "0%",
              rotate: flapOpen ? -3 : 0,
            }}
            transition={{ duration: 1.35, ease }}
            aria-hidden="true"
          />
          <motion.div
            className="letter-side right paper"
            animate={{
              x: lifting ? "110%" : flapOpen ? "3%" : "0%",
              rotate: flapOpen ? 3 : 0,
            }}
            transition={{ duration: 1.35, ease }}
            aria-hidden="true"
          />
          <motion.div
            className="letter-top-flap paper"
            style={{ zIndex: lifting ? 1 : 5 }}
            animate={{ rotateX: flapOpen ? -172 : 0 }}
            transition={{ duration: 1.25, ease }}
            onAnimationComplete={() => {
              if (phase.current === "opening") advance("opening", "revealing");
            }}
          >
            <div className="letter-flap-engraving" />
            <Ornament />
            <h1 className="letter-names">
              <span>{weddingData.couple.groom}</span>
              <em>&</em>
              <span>{weddingData.couple.bride}</span>
            </h1>
          </motion.div>
          <motion.button
            className="letter-wax"
            aria-label="Tap the seal to open invitation"
            disabled={state !== "sealed"}
            onClick={open}
            animate={
              state === "breaking"
                ? { scale: [1, 0.94, 1], y: [0, 0, 28], opacity: [1, 1, 0] }
                : { scale: 1, y: 0, opacity: state === "sealed" ? 1 : 0 }
            }
            transition={{ duration: 0.65, times: [0, 0.38, 1], ease }}
            onAnimationComplete={() => {
              if (phase.current === "breaking") advance("breaking", "opening");
            }}
          >
            <span className="wax-monogram">
              M<em>&</em>A
            </span>
            <i className="wax-reflection" />
          </motion.button>
          <motion.p
            className="letter-open-hint"
            animate={{ opacity: state === "sealed" ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            Tap the seal to open
          </motion.p>
          <motion.div
            className="letter-border-overlay"
            animate={{ y: lifting ? "115%" : "0%" }}
            transition={{ duration: 1.35, ease }}
            aria-hidden="true"
          >
            <Ornament className="letter-corner upper-left" />
            <Ornament className="letter-corner upper-right" />
            <Ornament className="letter-corner lower-left" />
            <Ornament className="letter-corner lower-right" />
          </motion.div>
        </>
      )}
    </div>
  );
}
