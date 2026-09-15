import { useRef, useState } from "react";
import { weddingData } from "../../data/weddingData";
export function AudioControl() {
  const audio = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  if (!weddingData.musicUrl) return null;
  async function toggle() {
    if (!audio.current) return;
    if (on) {
      audio.current.pause();
      setOn(false);
    } else {
      try {
        audio.current.volume = 0.25;
        await audio.current.play();
        setOn(true);
      } catch {
        setOn(false);
      }
    }
  }
  return (
    <>
      <audio ref={audio} src={weddingData.musicUrl} loop preload="none" />
      <button
        className="audio-control"
        onClick={toggle}
        aria-label={on ? "Mute music" : "Play music"}
        aria-pressed={on}
      >
        ♪ {on ? "On" : "Off"}
      </button>
    </>
  );
}
