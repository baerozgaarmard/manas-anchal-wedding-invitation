import { useEffect, useState, type RefObject } from "react";

/**
 * True from the first time the element comes on screen. CSS then plays the
 * entrance once on the compositor, instead of script following every scrolled frame.
 */
export function useShownOnce(ref: RefObject<Element | null>, rootMargin = "0px 0px -12% 0px") {
  const [shown, setShown] = useState(() => typeof IntersectionObserver === "undefined");
  useEffect(() => {
    const element = ref.current;
    if (!element || shown) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin, shown]);
  return shown;
}
