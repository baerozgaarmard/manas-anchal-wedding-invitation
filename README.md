# Manas & Anchal — A Wedding Story

An illustrated mobile-first invitation, built with React, TypeScript, Vite, Tailwind CSS and Framer Motion.

## Run

```sh
npm install
npm run dev
npm run build
```

## Wedding configuration

All wedding information lives in `src/data/weddingData.ts`.

- Confirmed wedding date: **02 November 2026**.
- `wedding.time` is intentionally `null`. The countdown targets the beginning of the wedding day in `Asia/Kolkata`, explicitly labeled as such. This does not imply a midnight ceremony.
- Set `wedding.time` to a confirmed local `HH:mm` ceremony time to count down to that moment instead.
- Set `wedding.year` to `null` if it becomes unconfirmed: the interface shows an honest waiting state instead of guessing a year.
- `todayMessage` and `pastMessage` control the finished countdown text. The wedding day is determined in the configured time zone, independent of guests' device time zones.
- Venue, address, ceremony times and family details remain unfilled. `mapUrl` enables a location link. Confirmed `startsAt` and `endsAt` ISO timestamps enable calendar downloads.
- `location.venue`, `location.address`, `location.googleMapsUrl`, and `location.embedUrl` configure the final venue/map chapter. Empty values show an illustrated, clearly labeled placeholder. An embed URL enables the interactive iframe; the external directions link only appears when its URL is supplied.
- `closing.message` controls the final emotional sentence.
- `musicUrl` enables optional user-controlled music. Supply a licensed audio file; music never autoplays.

## Story and interaction

Full-screen sealed letter → physical opening → scratch-to-reveal date → live countdown → illustrated journey → four unchanged ceremonies → emotional ending → venue → framed Google Map.

The first viewport is the sealed letter itself. Its explicit `sealed → breaking → opening → revealing → opened` state machine advances through Framer Motion completion callbacks. A synchronous guard prevents repeated opening; scrolling is locked until the same invitation sheet finishes emerging. No timeout chains or scroll repositioning are used. Reduced motion opens immediately.

The scratch card is the actual sheet inside the envelope, not a replacement screen. The date remains hidden until this chapter. A champagne foil canvas uses Pointer Events, pointer capture, a soft 46 CSS-pixel brush and `destination-out` compositing. It samples a small offscreen surface at most every 160 ms, excluding the arch's transparent corners, and completes when 50% is erased. Remaining foil dissolves and a few petals fall. No automatic scrolling follows the reveal.

The scratch surface captures pointer gestures; page scrolling is temporarily prevented while a stroke is active and restored on release, cancellation or completion. Resizing preserves the erased surface. Canvas failure, reduced motion and keyboard interaction are supported by the permanent tap-to-reveal alternative. The static HTML also includes a native details-based reveal when JavaScript cannot start; its date is injected from the same centralized configuration by Vite. A React error boundary preserves critical information if an interactive scene fails.

Countdown rendering and its one-second interval are isolated in `WeddingCountdown`. Timers and visibility listeners are cleaned up on unmount. No guest information is collected or stored.

## Artwork

Three original painted illustrations live in `public/images/`. The scratch garden is preloaded; later artwork is lazy loaded. The scratch leaf uses bespoke foil engraving and paper ornament. The countdown expands into an illustrated twilight palace. Reduced motion disables parallax, particles and number transitions.

## Verification

- Production TypeScript/Vite build.
- Browser QA: 390×844, 393×852, 430×932, 1440×1000; DPR 1–3.
- Physical mouse scratching, partial erasure, completion, no forced scrolling, live seconds, no form controls, no overflow or browser errors.
- Envelope state-order, duplicate-tap, scroll lock/release, no vertical jump and original ceremony visual checks.
- Venue placeholder plus mocked configured map: interactive iframe and safe new-tab directions link.
- Chrome touch emulation: cancellation, resize preservation, auto-completion, restored normal scrolling.
- Reduced-motion keyboard reveal, unavailable-canvas fallback and JavaScript-disabled date reveal.
- Countdown tests: Asia/Kolkata conversion, confirmed ceremony time, unknown/invalid targets, exact midnight boundary, wedding-day and post-wedding states.

These browser checks use desktop Chrome and mobile emulation. Physical Android devices and iPhone Safari have not been tested.

Useful checks:

```sh
node tools/test-countdown.cjs
node tools/qa-functional.cjs
node tools/qa-touch.cjs
node tools/qa-envelope-map.cjs
```

Browser QA scripts currently use the workspace's bundled Playwright runtime and local preview at port 5174; adjust these paths for another machine.
