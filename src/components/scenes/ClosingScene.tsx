import { useState } from "react";
import { motion } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { Ornament, Botanical, VerticalVenueSeparator } from "../ui/Ornament";

export function ClosingScene() {
  const { locations } = weddingData;
  const { familyResidence, sharmaFarms } = locations;
  const [activeMap, setActiveMap] = useState<string | null>(null);

  return (
    <section
      id="closing"
      className="ending-scene"
      aria-label="Our wedding venues"
    >
      <FloatingPetals count={6} />
      <div className="ending-top-fade" aria-hidden="true" />
      <div className="ending-venues paper">
        <div className="ending-venues-header">
          <Ornament />
          <p className="eyebrow">Locations</p>
          <h2 className="ending-venues-title">OUR VENUES</h2>
        </div>

        <div className="venues-grid">
          {/* Left Column: Family Residence */}
          <motion.div
            className="venue-column"
            initial={{ opacity: 0.9 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="venue-meta">
              <p className="venue-tag">CEREMONY VENUE</p>
              <h4 className="venue-name">{familyResidence.name}</h4>
              <div className="venue-address-lines">
                {familyResidence.address.map((line, idx) => (
                  <p key={idx} className="venue-address-line">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div
              className={`map-stationery ${activeMap === "family" ? "map-interactive" : ""}`}
              onClick={() => setActiveMap("family")}
            >
              {familyResidence.embedUrl ? (
                <iframe
                  key="map-family-residence"
                  src={familyResidence.embedUrl}
                  title={`Wedding venue: ${familyResidence.name}`}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div
                  className="map-awaiting"
                  role="img"
                  aria-label={`${familyResidence.name} map location`}
                >
                  <svg viewBox="0 0 360 240" aria-hidden="true">
                    <path d="M-10 160Q80 20 160 140T370 60M30-10Q100 90 30 250M190-10Q140 160 290 250M-10 60Q210 90 370 220" />
                    <circle cx="180" cy="110" r="28" />
                    <path
                      className="map-location-pin"
                      d="M180 86c-22 0-24 24 0 45 24-21 22-45 0-45Zm0 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z"
                    />
                  </svg>
                  <p>{familyResidence.name}</p>
                  <span>Village & Post Rudrapur</span>
                </div>
              )}
              {activeMap !== "family" && (
                <div
                  className="map-scroll-guard"
                  title="Tap to interact with map"
                />
              )}
              <span className="map-corner top-left" />
              <span className="map-corner bottom-right" />
            </div>

            <a
              className="stationery-action map-directions"
              href={familyResidence.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps <span aria-hidden="true">↗</span>
            </a>
          </motion.div>

          {/* Vertical Decorative Separator Between Venue Previews */}
          <VerticalVenueSeparator />

          {/* Right Column: Sharma Farms */}
          <motion.div
            className="venue-column"
            initial={{ opacity: 0.9 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.05,
            }}
          >
            <div className="venue-meta">
              <p className="venue-tag">MAIN WEDDING VENUE</p>
              <h4 className="venue-name">{sharmaFarms.name}</h4>
              <div className="venue-address-lines">
                {sharmaFarms.address.map((line, idx) => (
                  <p key={idx} className="venue-address-line">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div
              className={`map-stationery ${activeMap === "sharma" ? "map-interactive" : ""}`}
              onClick={() => setActiveMap("sharma")}
            >
              {sharmaFarms.embedUrl ? (
                <iframe
                  key="map-sharma-farms"
                  src={sharmaFarms.embedUrl}
                  title={`Wedding venue: ${sharmaFarms.name}`}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div
                  className="map-awaiting"
                  role="img"
                  aria-label={`${sharmaFarms.name} map location`}
                >
                  <svg viewBox="0 0 360 240" aria-hidden="true">
                    <path d="M-10 160Q80 20 160 140T370 60M30-10Q100 90 30 250M190-10Q140 160 290 250M-10 60Q210 90 370 220" />
                    <circle cx="180" cy="110" r="28" />
                    <path
                      className="map-location-pin"
                      d="M180 86c-22 0-24 24 0 45 24-21 22-45 0-45Zm0 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z"
                    />
                  </svg>
                  <p>{sharmaFarms.name}</p>
                  <span>Bahuwala, Dehradun</span>
                </div>
              )}
              {activeMap !== "sharma" && (
                <div
                  className="map-scroll-guard"
                  title="Tap to interact with map"
                />
              )}
              <span className="map-corner top-left" />
              <span className="map-corner bottom-right" />
            </div>

            <a
              className="stationery-action map-directions"
              href={sharmaFarms.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps <span aria-hidden="true">↗</span>
            </a>
          </motion.div>
        </div>

        <div className="ending-venues-footer">
          <Ornament />
          <Botanical className="ending-leaf" />
        </div>
      </div>
    </section>
  );
}
import { FloatingPetals } from "../ui/FloatingPetals";
