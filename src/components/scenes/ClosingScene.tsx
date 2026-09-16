import { motion } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { Ornament, Botanical } from "../ui/Ornament";
import { FloatingPetals } from "../ui/FloatingPetals";
export function ClosingScene() {
  const { location, closing, couple } = weddingData;
  return (
    <section
      id="closing"
      className="ending-scene"
      aria-label="With love, and wedding venue"
    >
      <div className="ending-emotion">
        <img
          className="scene-art"
          src="/images/opening-bg.webp"
          alt=""
          loading="lazy"
        />
        <div className="ending-wash" />
        <div className="ending-copy">
          <Ornament />
          <p className="eyebrow">With love</p>
          <h2 className="names">
            <span>{couple.groom}</span>
            <em>&</em>
            <span>{couple.bride}</span>
          </h2>
          <p className="script">{closing.message}</p>
          {weddingData.familyDetails && <p>{weddingData.familyDetails}</p>}
        </div>
        <FloatingPetals />
      </div>
      <div className="ending-location paper">
        <Ornament />
        <p className="eyebrow">Venue</p>
        <h3>{location.venue || "A beautiful place to gather"}</h3>
        <p className="venue-address">
          {location.address ||
            (location.venue
              ? "Address details will follow."
              : "Our wedding venue will be shared soon.")}
        </p>
        <motion.div
          className="map-stationery"
          initial={{ opacity: 0.7, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {location.embedUrl ? (
            <iframe
              src={location.embedUrl}
              title={`Wedding venue: ${location.venue || "Google Maps"}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div
              className="map-awaiting"
              role="img"
              aria-label="Wedding location will be announced"
            >
              <svg viewBox="0 0 360 240" aria-hidden="true">
                <path d="M-10 160Q80 20 160 140T370 60M30-10Q100 90 30 250M190-10Q140 160 290 250M-10 60Q210 90 370 220" />
                <path
                  className="map-river"
                  d="M-10 240Q140 210 135 130T370-15"
                />
                <circle cx="180" cy="110" r="28" />
                <path
                  className="map-location-pin"
                  d="M180 86c-22 0-24 24 0 45 24-21 22-45 0-45Zm0 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z"
                />
              </svg>
              <p>A place for our forever</p>
              <span>Location to be announced</span>
            </div>
          )}
          <span className="map-corner top-left" />
          <span className="map-corner bottom-right" />
        </motion.div>
        {location.googleMapsUrl && (
          <a
            className="stationery-action map-directions"
            href={location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps ↗
          </a>
        )}
        <Ornament />
        <Botanical className="ending-leaf" />
      </div>
    </section>
  );
}
