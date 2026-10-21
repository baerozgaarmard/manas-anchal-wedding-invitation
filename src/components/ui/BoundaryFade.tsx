// Covers the seam between chapters. It used to dim slightly at the screen edges while
// scrolling; it now stays at its on-screen strength so no script runs per frame.
export function BoundaryFade({ className }: { className: string }) {
  return <div className={className} aria-hidden="true" />;
}
