export function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`ornament ${className}`}
      viewBox="0 0 180 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 25h49c18 0 23-15 36-15s18 15 36 15h49M45 30c20 0 28 10 45 10s25-10 45-10M90 10V2m0 38v6"
        stroke="currentColor"
        strokeWidth=".8"
      />
      <path
        d="M90 13c-24-20-34 5 0 20 34-15 24-40 0-20Z"
        stroke="currentColor"
      />
      <circle cx="90" cy="24" r="3" fill="currentColor" />
    </svg>
  );
}
export function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`botanical ${className}`}
      viewBox="0 0 240 500"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 495C180 340 45 180 212 10M95 366Q20 310 25 240M113 240Q203 180 220 110M137 150Q70 112 110 40"
        stroke="currentColor"
        strokeWidth="2"
      />
      {Array.from({ length: 12 }, (_, i) => (
        <g
          key={i}
          transform={`translate(${78 + Math.sin(i) * 40} ${450 - i * 33}) rotate(${i % 2 ? 30 : -65})`}
        >
          <path
            d="M0 0C-55-18-64-65-44-62-17-60 0-30 0 0Z"
            fill="currentColor"
            opacity=".75"
          />
          <path
            d="M0 0C45-9 62-49 43-50 20-49 3-26 0 0Z"
            fill="currentColor"
            opacity=".5"
          />
        </g>
      ))}
    </svg>
  );
}
export function CeremonyIcon({ kind }: { kind: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="ceremony-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      {kind === "mata" ? (
        <>
          <path d="M12 39q20 28 40 0H12Zm20-5c-14-9 4-15 0-26 16 16 0 18 0 26Z" />
          <path d="M5 56h54M22 59h20" />
        </>
      ) : kind === "mehendi" ? (
        <>
          <path d="M13 10h38L32 34 13 10Zm19 24v22m-13 0h26M18 18h28" />
          <path d="M40 9c-3-13 14-8 13 1M10 34c10-12 22 8 5 13-8-6-12-9-5-13Z" />
        </>
      ) : kind === "haldi" ? (
        <>
          <path d="M10 34q22 38 44 0H10Zm12-4q10-17 20 0M22 55h20" />
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx="32"
              cy="14"
              rx="3"
              ry="7"
              transform={`rotate(${i * 45} 32 22)`}
            />
          ))}
        </>
      ) : (
        <>
          <path d="M7 56h50M12 56V24h40v32M7 24h50L32 7 7 24Zm15 32V29m20 27V29M7 20h50M28 7V3h8v4" />
          <path d="M24 49q8 12 16 0H24Zm8-3c-7-5 1-8 0-14 8 8 0 10 0 14Z" />
        </>
      )}
    </svg>
  );
}
