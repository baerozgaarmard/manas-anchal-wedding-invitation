# Manas & Anchal — A Wedding Story

A mobile-first React / TypeScript invitation, built with Vite, Tailwind CSS and Framer Motion.

## Run

```sh
npm install
npm run dev
npm run build
```

## Wedding details

Edit `src/data/weddingData.ts`. The year, times, venues, addresses, family details, music and RSVP destination are intentionally unfilled.

- `mapUrl` enables a ceremony's location link.
- `startsAt` and `endsAt` (ISO timestamps including a time zone) enable downloadable calendar invitations. Do not configure them until the wedding year and ceremony times are confirmed.
- `musicUrl` enables the user-controlled music toggle after entering. Supply a licensed audio file; music never autoplays.
- `rsvpEndpoint` enables delivery via a JSON POST containing `name`, `attendance`, `guests`, and `message`. The endpoint must validate input, apply rate limiting, support the site's origin, and return a successful HTTP response only after saving the reply.
- With no endpoint, the form explicitly prepares a session-local draft and never claims to have sent it. This is not a live RSVP collection service.

## Artwork and composition

Three original generated illustrations live in `public/images/`. Opening artwork is preloaded; later artwork is lazy loaded. The moonlit garden and sunny courtyard combine painted backgrounds with bespoke botanical, architectural and lighting layers. Replace assets at the same paths to preserve scene wiring; tune object position in `src/styles/globals.css` for different compositions.

Scene flow: opening → sealed envelope → formal invitation → illustrated journey → four ceremonies → RSVP → closing. Shared ornaments, particles and optional audio are in `src/components/ui/`. Event content stays centralized. CSS owns textures and environmental motion; Framer Motion owns scroll parallax, progress and title masks.

Reduced motion disables particles, strong parallax and decorative movement. Content is accessible without opening the envelope, and a keyboard skip link reaches the invitation.

## Validation

Production TypeScript/Vite build. Browser checks at 390×844, 393×852, 430×932 and 1440×1000: overflow, ceremony title visibility, seal opening, RSVP draft confirmation/editing, attendance switching, console errors and reduced-motion behavior.

The supplied 44-second reference was reviewed as a chronological sequence. Original composition follows its sparse text, environment changes and deliberate reveal pacing; no source artwork or wedding details were copied.
