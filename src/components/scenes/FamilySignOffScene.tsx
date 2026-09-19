import { motion } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Botanical, Ornament } from "../ui/Ornament";

export function FamilySignOffScene() {
  const reduced = useReducedMotion();
  return (
    <section id="family-sign-off" className="family-sign-off" aria-label="With affection from our families">
      <FloatingPetals count={6} />
      <Botanical className="family-foliage family-foliage-left" />
      <Botanical className="family-foliage family-foliage-right" />
      <div className="family-sign-off-copy">
        <Ornament className="family-top-ornament" />
        {weddingData.familySignOff.map((group, index) => (
          <motion.div
            className="family-sign-off-group"
            key={group.heading}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {index > 0 && <Ornament className="family-divider" />}
            <h2>{group.heading}</h2>
            <div className="family-names">
              {group.names.map((name) => <p key={name}>{name}</p>)}
            </div>
          </motion.div>
        ))}
        <Ornament className="family-final-ornament" />
      </div>
    </section>
  );
}
import { FloatingPetals } from "../ui/FloatingPetals";
