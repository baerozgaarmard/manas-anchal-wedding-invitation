import { Component } from "react";
import type { ReactNode } from "react";
import { weddingData } from "../data/weddingData";

// Critical invitation information remains usable if an interactive scene fails.
export class InvitationBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="paper">
        <section className="scene invitation">
          <p className="script">
            {weddingData.couple.groom} & {weddingData.couple.bride}
          </p>
          <details>
            <summary className="stationery-action">
              Tap to reveal our wedding date
            </summary>
            <h1>
              {weddingData.wedding.dateLabel} {weddingData.wedding.year}
            </h1>
            <p>The day we begin forever.</p>
          </details>
        </section>
      </main>
    );
  }
}
