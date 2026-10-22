import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { weddingData } from "../../data/weddingData";
import { Ornament, Botanical } from "../ui/Ornament";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { FloatingPetals } from "../ui/FloatingPetals";

export type EnvelopeState =
  "sealed" | "breaking" | "opening" | "revealing" | "opened";

// The opening, in ms from the tap. Each step adds an `s-<name>` class to the envelope:
// the seal peels and lifts away, the flap opens, the card slides out while the envelope
// lowers, then the card settles onto the real scratch card and the envelope fades away.
const STEPS = [
  ["press", 0],
  ["peel", 150],
  ["lift", 850],
  ["flap", 1250],
  ["rise", 2250],
  ["present", 3350],
  ["handoff", 4150],
] as const;
const FINISH_AT = 4950;
// The envelope scene is drawn on a 390×790 stage that is scaled to fit the screen.
const STAGE = { width: 390, height: 790 };
const ENVELOPE_WIDTH = 344;
const CARD = { left: 16, top: 24, width: 312, height: 400 };

const BLOB = "M56 4C72 3 86 9 96 20C106 30 110 44 108 58C110 72 104 86 93 96C82 106 68 110 54 108C40 110 26 104 16 93C6 82 2 68 4 54C3 40 9 26 20 16C30 6 42 3 56 4Z";
const LEAF = "M56 23C59.4 26.2 59.4 30 56 33C52.6 30 52.6 26.2 56 23Z";
const CROWN = "M48 46L50 41L53.5 44.5L56 39.5L58.5 44.5L62 41L64 46Z";
const FLAP = "M0 0H344V16C330 68 272 116 216 154C198 166 184 182 172 206C160 182 146 166 128 154C72 116 14 68 0 16Z";
const FLAP_EDGE = "M0 16C14 68 72 116 128 154C146 166 160 182 172 206C184 182 198 166 216 154C272 116 330 68 344 16";
const SIDE_LEFT = "M0 0V10C14 62 72 110 128 148C146 160 160 176 172 200V440H0Z";
const SIDE_RIGHT = "M344 0V10C330 62 272 110 216 148C198 160 184 176 172 200V440H344Z";
const SIDE_EDGE = "M0 10C14 62 72 110 128 148C146 160 160 176 172 200C184 176 198 160 216 148C272 110 330 62 344 10";
const BOTTOM_EDGE = "M0 440C62 392 122 320 160 254Q172 230 184 254C222 320 282 392 344 440";
const FOIL = "M0 310V76C0-25 274-25 274 76V310Z";
const FLOURISH = "M6 54C6 26 26 6 54 6M13 54C14 33 33 14 54 13M6 54C14 52 20 46 22 38M54 6C52 14 46 20 38 22";
const ROTATIONS = Array.from({ length: 12 }, (_, i) => i * 30);
const BEADS = Array.from({ length: 24 }, (_, i) => [56 + 38 * Math.cos((i * Math.PI) / 12), 56 + 38 * Math.sin((i * Math.PI) / 12)]);

function Wreath({ fill, shadow }: { fill: string; shadow?: boolean }) {
  return (
    <g fill={fill} fillOpacity={shadow ? 0.55 : undefined} transform={shadow ? "translate(.7 .9)" : undefined}>
      {ROTATIONS.map((angle) => <path key={angle} d={LEAF} transform={`rotate(${angle} 56 56)`} />)}
      <path d={CROWN} />
    </g>
  );
}

function RoyalDefs() {
  return (
    <svg width="0" height="0" className="re-defs" aria-hidden="true">
      <defs>
        <radialGradient id="re-wax" cx="35%" cy="28%" r="78%"><stop offset="0" stopColor="#b8404d" /><stop offset=".45" stopColor="#7c1a29" /><stop offset="1" stopColor="#3f0a13" /></radialGradient>
        <radialGradient id="re-press" cx="50%" cy="42%" r="62%"><stop offset="0" stopColor="#701626" /><stop offset="1" stopColor="#4a0c16" /></radialGradient>
        <radialGradient id="re-underside" cx="50%" cy="50%" r="60%"><stop offset="0" stopColor="#a14552" /><stop offset=".7" stopColor="#83303e" /><stop offset="1" stopColor="#5e1a26" /></radialGradient>
        <radialGradient id="re-stain"><stop offset="0" stopColor="#7a2a30" stopOpacity=".03" /><stop offset=".68" stopColor="#7a2a30" stopOpacity=".06" /><stop offset=".78" stopColor="#7a2a30" stopOpacity=".12" /><stop offset=".86" stopColor="#7a2a30" stopOpacity=".03" /><stop offset="1" stopColor="#7a2a30" stopOpacity="0" /></radialGradient>
        <linearGradient id="re-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e2a8" /><stop offset=".5" stopColor="#d6aa5c" /><stop offset="1" stopColor="#a47732" /></linearGradient>
        <linearGradient id="re-ribbon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9c2a3a" /><stop offset=".5" stopColor="#6e1826" /><stop offset="1" stopColor="#4a0d18" /></linearGradient>
        <linearGradient id="re-paper-flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fdf7ec" /><stop offset="1" stopColor="#f1e4cc" /></linearGradient>
        <linearGradient id="re-paper-left" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#efe1c7" /><stop offset="1" stopColor="#fbf3e4" /></linearGradient>
        <linearGradient id="re-paper-right" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#ebdcc0" /><stop offset="1" stopColor="#f8efde" /></linearGradient>
        <linearGradient id="re-paper-bottom" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#f0e2c9" /><stop offset="1" stopColor="#fbf4e6" /></linearGradient>
        <linearGradient id="re-foil" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="274" y2="310"><stop offset="0" stopColor="#b59057" /><stop offset=".22" stopColor="#e9d4a0" /><stop offset=".45" stopColor="#c4a06a" /><stop offset=".57" stopColor="#f0ddb2" /><stop offset=".78" stopColor="#cfad79" /><stop offset="1" stopColor="#9e7746" /></linearGradient>
        <clipPath id="re-flap-clip"><path d={FLAP} /></clipPath>
        <clipPath id="re-pocket-clip"><path d={SIDE_LEFT} /><path d={SIDE_RIGHT} /></clipPath>
        <pattern id="re-damask" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M13 5C15 9 15 11 13 13C11 11 11 9 13 5ZM13 21C11 17 11 15 13 13C15 15 15 17 13 21ZM5 13C9 11 11 11 13 13C11 15 9 15 5 13ZM21 13C17 15 15 15 13 13C15 11 17 11 21 13Z" fill="none" stroke="#c9a253" strokeWidth=".5" strokeOpacity=".55" /><circle r="1.2" fill="#c9a253" fillOpacity=".4" /><circle cx="26" cy="26" r="1.2" fill="#c9a253" fillOpacity=".4" /></pattern>
        <pattern id="re-liner" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#5b1220" /><path d="M14 6C16.5 10 16.5 12 14 14C11.5 12 11.5 10 14 6ZM14 22C11.5 18 11.5 16 14 14C16.5 16 16.5 18 14 22ZM6 14C10 11.5 12 11.5 14 14C12 16.5 10 16.5 6 14ZM22 14C18 16.5 16 16.5 14 14C16 11.5 18 11.5 22 14Z" fill="#c9a253" fillOpacity=".38" /><circle cx="14" cy="14" r="7.5" fill="none" stroke="#c9a253" strokeOpacity=".3" strokeWidth=".6" /><circle r="1.6" fill="#c9a253" fillOpacity=".45" /><circle cx="28" r="1.6" fill="#c9a253" fillOpacity=".45" /><circle cy="28" r="1.6" fill="#c9a253" fillOpacity=".45" /><circle cx="28" cy="28" r="1.6" fill="#c9a253" fillOpacity=".45" /></pattern>
        {/* The scratch foil's engraved rosettes, on the same 53px grid as ScratchCanvas. */}
        <pattern id="re-rosettes" x="12" y="25" width="53" height="53" patternUnits="userSpaceOnUse"><g fill="none" stroke="#6b4c25" strokeOpacity=".28" strokeWidth=".65">{[60, 120, 180, 240, 300, 360].map((angle) => <ellipse key={angle} cy="7" rx="3" ry="7" transform={`rotate(${angle})`} />)}</g></pattern>
        <symbol id="re-seal" viewBox="0 0 112 112">
          <path d={BLOB} fill="url(#re-wax)" />
          <path d={BLOB} fill="none" stroke="#f0a898" strokeOpacity=".3" strokeWidth="1.4" />
          <ellipse cx="36" cy="25" rx="17" ry="7" fill="#fff" fillOpacity=".13" transform="rotate(-32 36 25)" />
          <circle cx="56" cy="56" r="41" fill="url(#re-press)" />
          <circle cx="56" cy="56" r="41" fill="none" stroke="#24050c" strokeOpacity=".6" strokeWidth="1.8" />
          <circle cx="56.6" cy="57.2" r="41" fill="none" stroke="#f0a898" strokeOpacity=".22" strokeWidth=".8" />
          <g fill="url(#re-gold)">{BEADS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.35" />)}</g>
          <Wreath fill="#24050c" shadow />
          <Wreath fill="url(#re-gold)" />
          <circle cx="56" cy="56" r="20.5" fill="none" stroke="url(#re-gold)" strokeWidth=".7" strokeOpacity=".75" />
          <text className="re-mono" x="48.2" y="66.9" fill="#24050c" fillOpacity=".55">M</text>
          <text className="re-mono" x="65.2" y="66.9" fill="#24050c" fillOpacity=".55">A</text>
          <text className="re-mono" x="47.5" y="66" fill="url(#re-gold)">M</text>
          <text className="re-mono" x="64.5" y="66" fill="url(#re-gold)">A</text>
          <text className="re-amp" x="56" y="64" fill="url(#re-gold)">&amp;</text>
          <path d="M21 31l3-1.6 1.2 2-3 1.4zM88 23l2.6-.4.5 2.2-2.8.6zM95 80l2.4 1.2-1 2-2.4-1.2zM28 92l2.2-1.8 1.4 1.6-2.2 1.8z" fill="#d9b46a" fillOpacity=".8" />
        </symbol>
        <symbol id="re-underside" viewBox="0 0 112 112">
          <path d={BLOB} fill="url(#re-underside)" />
          <circle cx="56" cy="56" r="44" fill="none" stroke="#2a060c" strokeOpacity=".14" strokeWidth="2" />
          <path d="M28 42c9 2 15 7 21 13M60 30c4 6 5 12 4 19M70 76c6-3 12-3 18 0M34 74c5 4 8 9 9 15M50 60c7 1 13 4 18 9" fill="none" stroke="#f3e6cf" strokeOpacity=".5" strokeWidth=".8" strokeLinecap="round" />
          <path d="M58 70l8-2 3 5-7 3zM30 54l5-3 2 4-5 2zM76 40l6 1-1 5-6-1z" fill="#f3e6cf" fillOpacity=".42" />
        </symbol>
      </defs>
    </svg>
  );
}

export function EnvelopeScene({
  children,
  onOpened,
  onSealTap,
}: {
  children: ReactNode;
  onOpened: () => void;
  onSealTap?: () => void;
}) {
  const [step, setStep] = useState(-1);
  const [opened, setOpened] = useState(false);
  const started = useRef(false);
  const done = useRef(false);
  const timers = useRef<number[]>([]);
  const overlay = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const state: EnvelopeState = opened
    ? "opened"
    : step < 0 ? "sealed" : step < 3 ? "breaking" : step < 4 ? "opening" : "revealing";
  function finish() {
    if (done.current) return;
    done.current = true;
    timers.current.forEach(clearTimeout);
    setOpened(true);
    onOpened();
  }
  // Points the card at the real scratch card, so it lands exactly where that card sits.
  function aimCard() {
    const element = card.current, envelope = element?.parentElement;
    const page = document.querySelector<HTMLElement>("#scratch-date .date-stationery");
    if (!element || !envelope || !page) return;
    const box = envelope.getBoundingClientRect(), target = page.getBoundingClientRect();
    const scale = box.width / ENVELOPE_WIDTH, grow = target.width / (CARD.width * scale);
    const fromX = box.left + (CARD.left + CARD.width / 2) * scale;
    const fromY = box.top + (CARD.top + CARD.height / 2) * scale;
    element.style.setProperty("--aim-x", `${(target.left + target.width / 2 - fromX) / scale}px`);
    element.style.setProperty("--aim-y", `${(target.top + (CARD.height * scale * grow) / 2 - fromY) / scale}px`);
    element.style.setProperty("--aim-s", String(grow));
  }
  function open() {
    if (started.current) return;
    started.current = true;
    onSealTap?.();
    if (reduced) {
      finish();
      return;
    }
    timers.current = STEPS.map(([name, at], i) =>
      window.setTimeout(() => {
        if (name === "present") aimCard();
        setStep(i);
      }, at),
    );
    timers.current.push(window.setTimeout(finish, FINISH_AT));
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
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
    if (opened)
      document.getElementById("scratch-title")?.focus({ preventScroll: true });
  }, [opened]);
  // Fits the stage to the screen, and sizes the card's face like the real scratch card.
  useLayoutEffect(() => {
    const root = overlay.current;
    if (!root) return;
    const fit = () => {
      root.style.setProperty("--re-scale", String(Math.min(root.clientWidth / STAGE.width, root.clientHeight / STAGE.height)));
      const page = document.querySelector<HTMLElement>("#scratch-date .date-stationery");
      if (!page || !face.current) return;
      const width = page.offsetWidth;
      face.current.style.width = `${width}px`;
      face.current.style.height = `${(CARD.height * width) / CARD.width}px`;
      face.current.style.transform = `scale(${CARD.width / width})`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => observer.disconnect();
  }, [opened]);
  const steps = STEPS.slice(0, step + 1).map(([name]) => ` s-${name}`).join("");
  return (
    <div
      id="envelope"
      className={`letter-chapter letter-${state}${step >= STEPS.length - 1 ? " letter-handoff" : ""}`}
      data-envelope-state={state}
    >
      {!opened && (
        <button className="skip-link" onClick={finish}>
          Skip animation and open invitation
        </button>
      )}
      <div className="letter-content" inert={!opened} aria-hidden={!opened}>
        {children}
      </div>
      {!opened && (
        <div ref={overlay} className={`re-overlay${steps}`}>
          <RoyalDefs />
          <div className="re-damask" aria-hidden="true" />
          <div className="re-stage">
            <div className="re-bloom" aria-hidden="true" />
            <div className="re-names">
              <Ornament />
              <h1>
                <span>{weddingData.couple.groom}</span>
                <em>&</em>
                <span>{weddingData.couple.bride}</span>
              </h1>
            </div>
            <div className="re-envelope">
              <div className="re-body re-shadow" />
              <svg className="re-body re-back" viewBox="0 0 344 440" aria-hidden="true">
                <rect width="344" height="440" fill="url(#re-liner)" />
                <rect x="9" y="9" width="326" height="422" fill="none" stroke="#c9a253" strokeOpacity=".55" strokeWidth=".8" />
              </svg>
              <div ref={card} className="re-card" aria-hidden="true">
                {/* A miniature of the scratch card the envelope opens onto. */}
                <div ref={face} className="date-stationery re-face">
                  <div className="stationery-rule" />
                  <Botanical className="date-floral left" />
                  <Ornament />
                  <p className="date-couple">
                    {weddingData.couple.groom}
                    <em>&</em>
                    {weddingData.couple.bride}
                  </p>
                  <p className="scratch-instruction">Scratch to reveal our wedding date</p>
                  <svg className="re-foil" viewBox="0 0 274 310" preserveAspectRatio="xMidYMin slice">
                    <path d={FOIL} fill="url(#re-foil)" />
                    <path d={FOIL} fill="url(#re-rosettes)" />
                  </svg>
                </div>
              </div>
              <svg className="re-body re-pocket" viewBox="0 0 344 440" aria-hidden="true">
                <path d={SIDE_EDGE} fill="none" stroke="#3a1a0e" strokeOpacity=".16" strokeWidth="9" transform="translate(0 -3)" />
                <path d={SIDE_LEFT} fill="url(#re-paper-left)" />
                <path d={SIDE_RIGHT} fill="url(#re-paper-right)" />
                <path d={SIDE_LEFT} fill="url(#re-damask)" opacity=".45" />
                <path d={SIDE_RIGHT} fill="url(#re-damask)" opacity=".45" />
                <path className="re-line" d={SIDE_EDGE} />
                <path className="re-line-hi" d={SIDE_EDGE} transform="translate(0 1.4)" />
                <path d={BOTTOM_EDGE} fill="none" stroke="#5a3d22" strokeOpacity=".14" strokeWidth="10" transform="translate(0 -4)" />
                <path d={`${BOTTOM_EDGE}Z`} fill="url(#re-paper-bottom)" />
                <path d={`${BOTTOM_EDGE}Z`} fill="url(#re-damask)" opacity=".5" />
                <path className="re-line" d={BOTTOM_EDGE} />
                <path className="re-line-hi" d={BOTTOM_EDGE} transform="translate(0 1.4)" />
                <path className="re-line-fine" d={BOTTOM_EDGE} transform="translate(172 440) scale(.86) translate(-172 -440)" />
                <path d="M.5 0V439.5H343.5V0" fill="none" stroke="#c39a4f" strokeOpacity=".6" />
              </svg>
              <svg className="re-body re-pocket re-stain" viewBox="0 0 344 440" aria-hidden="true">
                <circle cx="172" cy="194" r="50" fill="url(#re-stain)" clipPath="url(#re-pocket-clip)" />
              </svg>
              <svg className="re-cast" viewBox="0 0 344 206" aria-hidden="true">
                <path d={FLAP_EDGE} fill="none" stroke="#5a3d22" strokeOpacity=".16" strokeWidth="10" strokeLinecap="round" />
              </svg>
              <div className="re-flap" aria-hidden="true">
                <div className="re-side front">
                  <svg className="re-art" viewBox="0 0 344 206">
                    <path d={FLAP} fill="url(#re-paper-flap)" />
                    <path d={FLAP} fill="url(#re-damask)" opacity=".5" />
                    <path className="re-line" d={FLAP_EDGE} />
                    <path className="re-line-hi" d={FLAP_EDGE} transform="translate(0 -1.4)" />
                    <path className="re-line-fine" d={FLAP_EDGE} transform="translate(172 0) scale(.88) translate(-172 0)" />
                  </svg>
                  <svg className="re-art re-stain" viewBox="0 0 344 206">
                    <circle cx="172" cy="194" r="50" fill="url(#re-stain)" clipPath="url(#re-flap-clip)" />
                  </svg>
                  <div className="re-stamp">
                    <div className="re-stamp-face">
                      <svg viewBox="0 0 40 44">
                        <path d="M5 21Q20 3 35 21M9 40V22M31 40V22M14 40V27Q20 20 26 27V40M3 40H37M6 43H34M20 12V7" />
                        <circle cx="20" cy="5.5" r="1.6" />
                        <circle cx="20" cy="32" r="1.2" />
                      </svg>
                      <span>Shubh Vivah</span>
                    </div>
                  </div>
                  <svg className="re-postmark" viewBox="0 0 212 96">
                    <path id="re-postmark-arc" d="M24 50A26 26 0 0 1 76 50" fill="none" />
                    <circle className="re-ring" cx="50" cy="50" r="34" />
                    <circle className="re-ring thin" cx="50" cy="50" r="24" />
                    <text className="re-arc-text"><textPath href="#re-postmark-arc" startOffset="50%">DEHRADUN</textPath></text>
                    <text className="re-year" x="50" y="58">2026</text>
                    <path className="re-waves" d="M90 30q8-6 16 0t16 0t16 0t16 0t16 0t16 0t16 0M90 42q8-6 16 0t16 0t16 0t16 0t16 0t16 0t16 0M90 54q8-6 16 0t16 0t16 0t16 0t16 0t16 0t16 0M90 66q8-6 16 0t16 0t16 0t16 0t16 0t16 0t16 0" />
                  </svg>
                  <svg className="re-art re-shade" viewBox="0 0 344 206"><path d={FLAP} fill="#4a2512" /></svg>
                </div>
                <div className="re-side back">
                  <svg className="re-art" viewBox="0 0 344 206">
                    <path d={FLAP} fill="url(#re-liner)" />
                    <path className="re-line" d={FLAP_EDGE} />
                    <path className="re-line-fine" d={FLAP_EDGE} transform="translate(172 0) scale(.88) translate(-172 0)" />
                  </svg>
                  <svg className="re-art re-shade" viewBox="0 0 344 206"><path d={FLAP} fill="#14040a" /></svg>
                </div>
              </div>
              <svg className="re-ribbon" viewBox="0 0 170 140" aria-hidden="true">
                <path d="M70 40L92 50L50 132L42 120L30 128Z" fill="url(#re-ribbon)" stroke="#c9a253" strokeWidth=".8" />
                <path d="M100 40L78 50L120 132L128 120L140 128Z" fill="url(#re-ribbon)" stroke="#c9a253" strokeWidth=".8" />
                <path d="M80 46L40 124M90 46L130 124" fill="none" stroke="#c44d5e" strokeOpacity=".45" strokeWidth="2" />
              </svg>
              <div className="re-seal-shadow" aria-hidden="true" />
              <div className="re-halo" aria-hidden="true" />
              <button
                className="letter-wax re-seal"
                aria-label="Tap the seal to open invitation"
                disabled={step >= 0}
                onClick={open}
              >
                <span className="re-peel">
                  <span className="re-stuck">
                    <span className="re-stuck-art">
                      <svg viewBox="0 0 112 112" aria-hidden="true"><use href="#re-seal" /></svg>
                      <span className="re-glint" />
                    </span>
                  </span>
                  <span className="re-flip-wrap">
                    <span className="re-flip">
                      <span className="re-flip-art">
                        <svg viewBox="0 0 112 112" aria-hidden="true"><use href="#re-underside" /></svg>
                        <span className="re-crease" />
                      </span>
                    </span>
                  </span>
                </span>
              </button>
              <div className="re-crumbs" aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => <i key={i} />)}
              </div>
            </div>
            <p className="re-hint">Tap the seal to open</p>
          </div>
          <FloatingPetals count={6} />
          <div className="re-frame" aria-hidden="true" />
          {["tl", "tr", "bl", "br"].map((corner) => (
            <svg key={corner} className={`re-corner ${corner}`} viewBox="0 0 60 60" aria-hidden="true">
              <path d={FLOURISH} />
              <circle cx="22" cy="22" r="2.2" />
            </svg>
          ))}
        </div>
      )}
    </div>
  );
}
