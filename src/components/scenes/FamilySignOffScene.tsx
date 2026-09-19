import { ScrollReveal } from "../ui/ScrollReveal";
import { weddingData } from "../../data/weddingData";
import { Botanical, Ornament } from "../ui/Ornament";

export function FamilySignOffScene() {
  return (
    <section id="family-sign-off" className="family-sign-off" aria-label="With affection from our families">
      <FloatingPetals count={6} />
      <Botanical className="family-foliage family-foliage-left" />
      <Botanical className="family-foliage family-foliage-right" />
      <div className="family-sign-off-copy">
        <Ornament className="family-top-ornament" />
        {weddingData.familySignOff.map((group, index) => (
          <ScrollReveal
            className="family-sign-off-group"
            key={group.heading}
          >
            {index > 0 && <Ornament className="family-divider" />}
            <h2>{group.heading}</h2>
            <div className="family-names">
              {group.names.map((name) => <p key={name}>{name}</p>)}
            </div>
          </ScrollReveal>
        ))}
        <Ornament className="family-final-ornament" />
      </div>
    </section>
  );
}
import { FloatingPetals } from "../ui/FloatingPetals";
