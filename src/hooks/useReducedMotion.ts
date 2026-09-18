import { useSyncExternalStore } from "react";

const media = window.matchMedia("(prefers-reduced-motion: reduce)");
let override: boolean | null = null;
try {
  const saved = sessionStorage.getItem("invitation-reduced-motion");
  if (saved !== null) override = saved === "true";
} catch { /* Storage is optional in private browsing. */ }
const listeners = new Set<() => void>();
function snapshot() { return override ?? media.matches; }
function update() {
  document.documentElement.dataset.motion = snapshot() ? "reduced" : "full";
  listeners.forEach(listener => listener());
}
media.addEventListener("change", update);
update();
export function setReducedMotion(reduced: boolean) {
  override = reduced;
  try { sessionStorage.setItem("invitation-reduced-motion", String(reduced)); } catch { /* Optional. */ }
  update();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => true);
}
