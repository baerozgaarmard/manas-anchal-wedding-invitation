import { useReducedMotion } from "./hooks/useReducedMotion";
import { useRef, useState } from "react";
import { motion, useScroll, useSpring, MotionConfig } from "framer-motion";
import { JourneyScene } from "./components/scenes/JourneyScene";
import { AudioControl, type MusicHandle } from "./components/ui/AudioControl";
import { CeremonyScenes } from "./components/scenes/CeremonyScenes";
import { EnvelopeScene } from "./components/scenes/EnvelopeScene";
import { ScratchRevealScene } from "./components/scenes/ScratchRevealScene";
import { ClosingScene } from "./components/scenes/ClosingScene";
import { FamilySignOffScene } from "./components/scenes/FamilySignOffScene";
import "./styles/globals.css";
function App() {
  const reduced = useReducedMotion();
  const music = useRef<MusicHandle>(null);
  const [opened, setOpened] = useState(false);
  const [dateRevealed, setDateRevealed] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 70, damping: 25 });
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <motion.div className="reading-thread" style={{ scaleX }} />
      <main>
        <EnvelopeScene onSealTap={() => music.current?.startFromSeal()} onOpened={() => setOpened(true)}>
          <ScratchRevealScene
            revealed={dateRevealed}
            onReveal={() => setDateRevealed(true)}
          />
        </EnvelopeScene>
        <div
          inert={!opened}
          style={{ visibility: opened ? "visible" : "hidden" }}
        >
          <JourneyScene />
          <CeremonyScenes />
          <ClosingScene />
          <FamilySignOffScene />
        </div>
      </main>
      <AudioControl ref={music} />
    </MotionConfig>
  );
}
export default App;
