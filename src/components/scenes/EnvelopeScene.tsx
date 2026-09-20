import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { Ornament, Botanical } from "../ui/Ornament";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { FloatingPetals } from "../ui/FloatingPetals";

export type EnvelopeState =
  "sealed" | "breaking" | "opening" | "revealing" | "opened";
const ease = [0.22, 1, 0.36, 1] as const;
export function EnvelopeScene({
  children,
  onOpened,
  onSealTap,
}: {
  children: ReactNode;
  onOpened: () => void;
  onSealTap?: () => void;
}) {
  const [state, setState] = useState<EnvelopeState>("sealed");
  const phase = useRef<EnvelopeState>("sealed");
  const reduced = useReducedMotion();
  const opened = state === "opened";
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
    onSealTap?.();
    if (reduced) {
      finish();
      return;
    }
    advance("sealed", "breaking");
  }
  useEffect(() => {
    if (opened) return;
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
  }, [opened]);
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
        animate={state}
        variants={{
          sealed: { y: 22, scale: 0.985, opacity: 0 },
          breaking: { y: 22, scale: 0.985, opacity: 0 },
          opening: { y: 22, scale: 0.985, opacity: 1 },
          revealing: { y: 0, scale: 1, opacity: 1 },
          opened: { y: 0, scale: 1, opacity: 1 },
        }}
        transition={{ duration: reduced ? 0 : 0.95, ease }}
        onAnimationComplete={(definition) => {
          if (definition === "revealing" && phase.current === "revealing") finish();
        }}
      >
        {children}
      </motion.div>
      {state !== "opened" && (
        <>
          <FloatingPetals count={6} />
          <motion.div
            className="letter-back paper"
            animate={{ y: lifting ? "110%" : "0%" }}
            transition={{ duration: 0.9, ease }}
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
            transition={{ duration: 0.9, ease }}
            aria-hidden="true"
          />
          <motion.div
            className="letter-side left paper"
            animate={{
              x: lifting ? "-110%" : flapOpen ? "-3%" : "0%",
              rotate: flapOpen ? -3 : 0,
            }}
            transition={{ duration: 0.9, ease }}
            aria-hidden="true"
          />
          <motion.div
            className="letter-side right paper"
            animate={{
              x: lifting ? "110%" : flapOpen ? "3%" : "0%",
              rotate: flapOpen ? 3 : 0,
            }}
            transition={{ duration: 0.9, ease }}
            aria-hidden="true"
          />
          <motion.div
            className="letter-top-flap paper"
            style={{ zIndex: 5 }}
            initial={false}
            animate={flapOpen ? "open" : "closed"}
            variants={{ open: { rotateX: -172 }, closed: { rotateX: 0 } }}
            transition={{ duration: 0.72, ease: [0.3, 0.65, 0.25, 1] }}
            onAnimationComplete={(definition) => {
              if (definition === "open" && phase.current === "opening") advance("opening", "revealing");
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
            whileTap={state === "sealed" ? { scale: 0.965, transition: { duration: 0.07 } } : undefined}
            initial={false}
            animate={state === "sealed" ? "rest" : "release"}
            variants={{
              release: { scale: [0.965, 0.97, 1.015], y: [0, 1, 16], opacity: [1, 1, 0] },
              rest: { scale: 1, y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.38, times: [0, 0.24, 1], ease }}
            onAnimationComplete={(definition) => {
              if (definition === "release" && phase.current === "breaking") advance("breaking", "opening");
            }}
          >
            <span className="wax-monogram">
              M<em>&</em>A
            </span>
            <i className="wax-reflection" />
            <svg className="wax-release-line" viewBox="0 0 94 94" aria-hidden="true"><path d="M18 68 34 57 39 48 50 44 55 32 74 22" /></svg>
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
            transition={{ duration: 0.9, ease }}
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
