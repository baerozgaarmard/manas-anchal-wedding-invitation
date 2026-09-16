import { weddingData } from "../../data/weddingData";
import { WeddingCountdown } from "../interactive/WeddingCountdown";
import { Ornament, Botanical } from "../ui/Ornament";

export function CountdownScene({ revealed }: { revealed: boolean }) {
  return (
    <section
      id="countdown"
      className={`scene countdown-scene ${revealed ? "countdown-awake" : ""}`}
      aria-labelledby="countdown-title"
    >
      <img
        className="scene-art"
        src="/images/opening-bg.webp"
        alt=""
        loading="lazy"
      />
      <div className="countdown-twilight" />
      <div className="countdown-arch" />
      <Botanical className="countdown-botanical" />
      <div className="countdown-copy">
        <Ornament />
        <p className="eyebrow">Every moment brings us closer</p>
        <h2 id="countdown-title">
          Until we say
          <br />
          <em>I do.</em>
        </h2>
        {revealed ? (
          <>
            <p className="countdown-date">
              {weddingData.wedding.dateLabel}
              {weddingData.wedding.year && <> · {weddingData.wedding.year}</>}
            </p>
            <WeddingCountdown />
            <p className="script countdown-romance">
              A lifetime of love.
              <br />
              Almost within reach.
            </p>
            <a href="#journey" className="scroll-hint">
              Follow our celebration <span>↓</span>
            </a>
          </>
        ) : (
          <div className="countdown-waiting">
            <p className="script">First, a little secret to uncover.</p>
            <a href="#scratch-date" className="stationery-action">
              Discover our date ↑
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
