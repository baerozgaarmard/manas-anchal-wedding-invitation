import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { weddingData } from "../../data/weddingData";
import { Ornament, Botanical } from "../ui/Ornament";
export function RSVPScene() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "saved" | "sent" | "error"
  >("idle");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [attendance, setAttendance] = useState("yes");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (attendance === "no") data.guests = "0";
    setDraft(data as Record<string, string>);
    setStatus("sending");
    try {
      if (weddingData.rsvpEndpoint) {
        const response = await fetch(weddingData.rsvpEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw Error("Delivery failed");
        setStatus("sent");
      } else {
        sessionStorage.setItem("manas-anchal-rsvp-draft", JSON.stringify(data));
        setStatus("saved");
      }
    } catch {
      setStatus("error");
    }
  }
  return (
    <section id="rsvp" className="scene rsvp paper">
      <Botanical />
      <Ornament />
      <p className="eyebrow">The most beautiful part is you</p>
      <h2>
        Will you celebrate
        <br />
        <em>with us?</em>
      </h2>
      <AnimatePresence mode="wait">
        {status === "saved" || status === "sent" ? (
          <motion.div
            className="rsvp-confirmation"
            key="confirmation"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            role="status"
          >
            <Ornament />
            <h3>
              {status === "sent"
                ? "With heartfelt thanks."
                : "Your reply is prepared."}
            </h3>
            <p>
              {status === "sent"
                ? attendance === "yes"
                  ? "We cannot wait to celebrate with you."
                  : "Thank you for your wishes. You will be missed."
                : "Saved in this tab. Your reply has not been sent; RSVP delivery details will be added soon."}
            </p>
            <button
              className="stationery-action"
              onClick={() => setStatus("idle")}
            >
              Edit your reply ↗
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            className="rsvp-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <label>
              Your name
              <input
                name="name"
                defaultValue={draft.name}
                autoComplete="name"
                placeholder="Full name"
                required
                maxLength={100}
              />
            </label>
            <fieldset>
              <legend>Can you join us?</legend>
              <label className="radio-label">
                <input
                  type="radio"
                  name="attendance"
                  value="yes"
                  checked={attendance === "yes"}
                  onChange={() => setAttendance("yes")}
                />{" "}
                Joyfully accept
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="attendance"
                  value="no"
                  checked={attendance === "no"}
                  onChange={() => setAttendance("no")}
                />{" "}
                Regretfully decline
              </label>
            </fieldset>
            {attendance === "yes" && (
              <label>
                Number of guests, including you
                <input
                  type="number"
                  name="guests"
                  min="1"
                  max="20"
                  defaultValue={draft.guests || "1"}
                  required
                  inputMode="numeric"
                />
              </label>
            )}
            <label>
              A little note for us
              <textarea
                name="message"
                defaultValue={draft.message}
                placeholder="Your wishes, with love…"
                rows={2}
                maxLength={1000}
              />
            </label>
            {!weddingData.rsvpEndpoint && (
              <p className="rsvp-note">
                RSVP delivery details will follow. You can prepare your reply
                here.
              </p>
            )}
            {status === "error" && (
              <p role="alert">
                Your reply could not be saved. Please try again.
              </p>
            )}
            <button
              className="stationery-action submit-reply"
              disabled={status === "sending"}
            >
              {status === "sending"
                ? "Preparing…"
                : weddingData.rsvpEndpoint
                  ? "Send with love ↗"
                  : "Prepare my reply ↗"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      <Ornament />
    </section>
  );
}
