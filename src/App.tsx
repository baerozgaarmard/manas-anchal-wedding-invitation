import { useRef, useState } from "react";
import { motion, useScroll, useSpring, MotionConfig } from "framer-motion";
import { weddingData } from "./data/weddingData";
import { Botanical, CeremonyIcon } from "./components/ui/Ornament";
import { AudioControl } from "./components/ui/AudioControl";
import { CeremonyScenes } from "./components/scenes/CeremonyScenes";
import { EnvelopeScene } from "./components/scenes/EnvelopeScene";
import { ScratchRevealScene } from "./components/scenes/ScratchRevealScene";
import { CountdownScene } from "./components/scenes/CountdownScene";
import { ClosingScene } from "./components/scenes/ClosingScene";
import "./styles/globals.css";
function App() {
  const [opened, setOpened] = useState(false);
  const [dateRevealed, setDateRevealed] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 70, damping: 25 });
  return (
    <MotionConfig reducedMotion="user">
      <motion.div className="reading-thread" style={{ scaleX }} />
      <main>
        <EnvelopeScene onOpened={() => setOpened(true)}>
          <ScratchRevealScene
            revealed={dateRevealed}
            onReveal={() => setDateRevealed(true)}
          />
        </EnvelopeScene>
        <div
          inert={!opened}
          style={{ visibility: opened ? "visible" : "hidden" }}
        >
          <CountdownScene revealed={dateRevealed} />
          <JourneyScene />
          <CeremonyScenes />
          <ClosingScene />
        </div>
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
