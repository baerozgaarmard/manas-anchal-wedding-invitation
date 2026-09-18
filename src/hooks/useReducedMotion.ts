import { useSyncExternalStore } from "react";

const media = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
const listeners = new Set<() => void>();

function snapshot() {
  return media?.matches ?? false;
}

function update() {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.motion = snapshot() ? "reduced" : "full";
  }
  listeners.forEach((listener) => listener());
}

if (media) {
  media.addEventListener("change", update);
  update();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

