import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { weddingData } from "../../data/weddingData";
export type MusicHandle = { startFromSeal: () => void };
export const AudioControl = forwardRef<MusicHandle>(function AudioControl(_, ref) {
  const audio = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);
  const context = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const frame = useRef(0);
  const fadeEnd = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const generation = useRef(0);
  const desired = useRef(false);
  const interacted = useRef(false);
  function cancelFade() {
    cancelAnimationFrame(frame.current);
    clearTimeout(fadeEnd.current);
    const ctx = context.current;
    const param = gain.current?.gain;
    if (ctx && param) {
      const value = param.value;
      param.cancelScheduledValues(ctx.currentTime);
      param.setValueAtTime(value, ctx.currentTime);
    }
  }
  function fade(target: number, done?: () => void, duration = 500) {
    cancelFade();
    const element = audio.current;
    if (!element) return;
    const ctx = context.current;
    if (ctx && gain.current) {
      // The audio clock keeps this smooth even when backgrounded frames stop.
      gain.current.gain.linearRampToValueAtTime(target, ctx.currentTime + duration / 1000);
      if (done) fadeEnd.current = setTimeout(done, duration + 20);
      return;
    }
    const initial = gain.current?.gain.value ?? element.volume;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const value = initial + (target - initial) * progress;
      if (gain.current) gain.current.gain.value = value;
      else element.volume = value;
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else done?.();
    };
    frame.current = requestAnimationFrame(tick);
  }
  function play() {
    const element = audio.current;
    if (!element) return;
    const attempt = ++generation.current;
    desired.current = true;
    cancelFade();
    element.muted = false;
    if (!context.current) {
      try {
        const ctx = new AudioContext();
        const node = ctx.createGain();
        node.gain.value = 0;
        ctx.createMediaElementSource(element).connect(node);
        node.connect(ctx.destination);
        context.current = ctx;
        gain.current = node;
      } catch { element.volume = 0; }
    }
    void context.current?.resume().catch(() => {});
    // Invoke in the gesture itself, before any asynchronous animation handoff.
    void element.play().then(() => {
      if (attempt !== generation.current || !desired.current) return;
      setOn(true);
      fade(0.4);
    }).catch(() => {
      if (attempt !== generation.current) return;
      desired.current = false;
      setOn(false);
    });
  }
  useImperativeHandle(ref, () => ({ startFromSeal() {
    if (interacted.current) return;
    interacted.current = true;
    play();
  } }));
  useEffect(() => {
    const element = audio.current;
    function stopImmediately() {
      generation.current++;
      desired.current = false;
      cancelFade();
      if (gain.current && context.current) {
        // Clear the complete timeline before suspension, including held values.
        // A scheduled zero may not render once the audio clock has stopped.
        gain.current.gain.cancelScheduledValues(0);
        gain.current.gain.value = 0;
      }
      if (element) {
        element.muted = true;
        element.pause();
      }
      setOn(false);
      // Suspend instead of tearing down a live audio output during navigation.
      void context.current?.suspend().catch(() => {});
    }
    function onVisibilityChange() {
      if (document.visibilityState !== "hidden") return;
      generation.current++;
      desired.current = false;
      setOn(false);
      if (gain.current && context.current?.state === "running") {
        fade(0, stopImmediately, 60);
      } else stopImmediately();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", stopImmediately);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", stopImmediately);
      stopImmediately();
    };
  }, []);
  if (!weddingData.musicUrl) return null;
  function toggle() {
    interacted.current = true;
    if (!desired.current) { play(); return; }
    desired.current = false;
    generation.current++;
    setOn(false);
    fade(0, () => audio.current?.pause());
  }
  return (
    <>
      <audio ref={audio} src={weddingData.musicUrl} loop preload="auto" onPause={() => setOn(false)} onError={() => { desired.current = false; setOn(false); }} />
      <button
        className="audio-control"
        onClick={toggle}
        aria-label={on ? "Music On — mute music" : "Music Off — play music"}
        aria-pressed={on}
      >
        ♪ {on ? "On" : "Off"}
      </button>
    </>
  );
});
