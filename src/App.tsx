import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionConfig,
} from "framer-motion";
import { weddingData } from "./data/weddingData";
import { Ornament, Botanical, CeremonyIcon } from "./components/ui/Ornament";
import { FloatingPetals } from "./components/ui/FloatingPetals";
import { AudioControl } from "./components/ui/AudioControl";
import { CeremonyScenes } from "./components/scenes/CeremonyScenes";
import { RSVPScene } from "./components/scenes/RSVPScene";
import { useReducedMotion } from "./hooks/useReducedMotion";
import "./styles/globals.css";
export function Names({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`names ${compact ? "compact" : ""}`}>
      <span>{weddingData.couple.groom}</span>
      <em>&</em>
      <span>{weddingData.couple.bride}</span>
    </div>
  );
}
function App() {
  const [opened, setOpened] = useState(false);
  const [unsealed, setUnsealed] = useState(false);
  const reduced = useReducedMotion();
  const opening = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: opening,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const { scrollYProgress: progress } = useScroll();
  const scaleX = useSpring(progress, { stiffness: 70, damping: 25 });
  function enter() {
    setOpened(true);
    document
      .getElementById("envelope")
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  }
  function unseal() {
    if (unsealed) return;
    setUnsealed(true);
    setTimeout(
      () =>
        document
          .getElementById("invitation")
          ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" }),
      reduced ? 0 : 1900,
    );
  }
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#invitation">
        Skip to invitation
      </a>
      <motion.div className="reading-thread" style={{ scaleX }} />
      <main>
        <section
          className="scene opening"
          ref={opening}
          aria-label="Manas and Anchal wedding invitation"
        >
          <motion.img
            className="scene-art"
            src="/images/opening-bg.webp"
            alt=""
            fetchPriority="high"
            style={{ y: reduced ? 0 : y }}
          />
          <div className="opening-wash" />
          <div className="frame-line" />
          <div className="opening-copy">
            <p className="eyebrow">A celebration of love</p>
            <Ornament />
            <Names />
            <p className="opening-sub">
              Some stories are written in the stars.
              <br />
              Ours begins with you.
            </p>
            <button className="stationery-action open-action" onClick={enter}>
              Open invitation <span>↗</span>
            </button>
            <span className="tiny-cue">TOUCH TO BEGIN</span>
          </div>
          <FloatingPetals />
          <span className="edition">THE WEDDING CELEBRATION</span>
        </section>
        <section
          id="envelope"
          className={`scene envelope-scene ${unsealed ? "unsealed" : ""}`}
          aria-label="Open the wedding envelope"
        >
          <Botanical />
          <p className="eyebrow">A little something, sealed with love</p>
          <div className="envelope-stage">
            <div className="envelope">
              <div className="envelope-paper">
                <Ornament />
                <span>
                  {weddingData.couple.groom} & {weddingData.couple.bride}
                </span>
                <p>You are warmly invited</p>
              </div>
              <div className="envelope-back" />
              <div className="envelope-flap" />
              <div className="envelope-front" />
              <button
                className="wax-seal"
                onClick={unseal}
                aria-label="Break the seal and reveal invitation"
                disabled={unsealed}
              >
                <span>
                  M<span className="seal-amp">&</span>A
                </span>
              </button>
            </div>
          </div>
          <p className="envelope-caption">
            {unsealed ? "A beautiful beginning awaits…" : "A moment to unfold."}
          </p>
          <button
            className="stationery-action"
            onClick={unseal}
            disabled={unsealed}
          >
            {unsealed ? "With all our love" : "Touch the seal to open"}
          </button>
          <Ornament />
        </section>
        <section id="invitation" className="scene invitation paper">
          <div className="invitation-border" />
          <Ornament />
          <p className="traditional">श्री गणेशाय नमः</p>
          <p className="eyebrow">Together with their families</p>
          <Names />
          <p className="invitation-line">
            request the pleasure of your company
            <br />
            as they begin their forever.
          </p>
          <div className="formal-date">
            <span>
              {weddingData.events[3].date.split(" ")[1].toUpperCase()}
            </span>
            <strong>{weddingData.events[3].date.split(" ")[0]}</strong>
            <span>THE WEDDING</span>
          </div>
          <p className="script">A promise. A celebration. A lifetime.</p>
          <Ornament />
          <a className="scroll-hint" href="#journey">
            The celebrations await <span>↓</span>
          </a>
        </section>
        <JourneyScene />
        <CeremonyScenes />
        <RSVPScene />
        <section className="scene closing">
          <img
            className="scene-art"
            src="/images/opening-bg.webp"
            alt=""
            loading="lazy"
          />
          <div className="closing-wash" />
          <div className="closing-copy">
            <Ornament />
            <p className="script">With love, always</p>
            <Names compact />
            <p>
              Our joy will be complete
              <br />
              with you by our side.
            </p>
            {weddingData.familyDetails && <p>{weddingData.familyDetails}</p>}
            <Ornament />
            <a href="#" className="stationery-action">
              Back to the beginning ↑
            </a>
          </div>
          <FloatingPetals />
        </section>
      </main>
      {opened && <AudioControl />}
    </MotionConfig>
  );
}
function JourneyScene() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 70%"],
  });
  return (
    <section id="journey" className="journey paper" ref={ref}>
      <p className="eyebrow">Four days. Countless memories.</p>
      <h2>The celebrations</h2>
      <p className="script">A journey to forever</p>
      <div className="journey-path">
        <svg
          className="thread-svg"
          viewBox="0 0 40 750"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M20 0Q-8 95 20 188T20 375T20 562T20 750"
            stroke="#b79a7050"
          />
          <motion.path
            d="M20 0Q-8 95 20 188T20 375T20 562T20 750"
            stroke="#a47a42"
            style={{ pathLength: scrollYProgress }}
          />
        </svg>
        {weddingData.events.map((event, i) => (
          <a
            className={`journey-stop stop-${i}`}
            href={`#${event.id}`}
            key={event.id}
          >
            <CeremonyIcon kind={event.id} />
            <div>
              <p className="eyebrow">{event.date}</p>
              <h3>{event.title}</h3>
              <span className="journey-arrow">Discover the celebration ↗</span>
            </div>
            <span className="thread-node" />
          </a>
        ))}
      </div>
      <Botanical />
    </section>
  );
}
export default App;
