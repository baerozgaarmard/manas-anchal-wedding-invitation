import { motion } from "framer-motion";
import type { MotionValue } from "framer-motion";

const illustrations: Record<string, string[]> = {
  mata: [
    "M18 57Q48 88 78 57Z M22 61Q48 78 74 61 M34 77H62 M29 82H67",
    "M48 53C27 39 53 31 48 14C69 33 63 46 48 53Z M48 48C41 40 52 35 51 29",
    "M13 49Q8 32 23 20 M73 20Q88 32 83 49 M18 47Q15 34 25 26 M71 26Q81 34 78 47",
    "M17 14L20 10L23 14L20 18Z M73 14L76 10L79 14L76 18Z M8 58H13 M83 58H88",
    "M24 87Q34 81 40 87Q34 92 24 87Z M72 87Q62 81 56 87Q62 92 72 87Z",
  ],
  mehendi: [
    "M25 24H76L51 53Z M31 30H70 M51 53V77 M38 81Q51 75 64 81 M34 84H68",
    "M57 22L67 8 M65 11L73 13 M70 23C75 9 90 20 81 30 M73 23L81 30",
    "M39 38Q51 33 62 38 M44 42Q51 38 58 42",
    "M16 70Q31 51 21 32 M19 44C4 43 6 29 19 37C30 21 38 38 22 43 M17 58C2 61 4 47 16 51C27 43 33 54 17 58",
    "M14 23Q4 14 16 11Q24 15 14 23Z M11 74Q22 81 27 73 M72 64L75 60L78 64L75 68Z",
  ],
  haldi: [
    "M16 51Q48 86 80 51Z M16 51Q48 42 80 51 M24 57Q48 75 72 57 M33 77H63 M27 82H69",
    "M29 48Q34 31 48 36Q63 31 67 48 M37 44Q48 40 60 45",
    "M48 28C37 17 42 7 48 17C54 7 60 17 48 28Z M43 26C26 28 23 17 35 19C34 8 46 12 43 26Z M53 26C70 28 73 17 61 19C62 8 50 12 53 26Z",
    "M12 39L8 31 M21 29L16 23 M75 29L80 23 M84 39L88 31",
    "M14 70C2 62 7 57 16 64 M82 70C94 62 89 57 80 64 M37 87H59",
  ],
  vivah: [
    "M9 32Q28 27 48 13Q68 27 87 32 M13 36H83 M17 32Q32 29 48 20Q64 29 79 32 M44 13V8Q48 3 52 8V13",
    "M19 38V77 M25 38V77 M71 38V77 M77 38V77 M15 78H29 M67 78H81 M12 83H84 M8 88H88",
    "M25 39Q36 57 48 39Q60 57 71 39 M25 40Q25 62 33 68 M71 40Q71 62 63 68",
    "M35 69Q48 83 61 69Z M48 66C35 56 51 53 48 44C62 56 56 62 48 66Z M43 70H53",
    "M19 44H25 M19 71H25 M71 44H77 M71 71H77 M35 35V41 M61 35V41 M46 30H50",
  ],
};

export function JourneyIcon({
  kind,
  draw,
}: {
  kind: string;
  draw: MotionValue<number>;
}) {
  return (
    <svg
      className="journey-illustration"
      viewBox="0 0 96 96"
      fill="none"
      stroke="currentColor"
      strokeWidth=".95"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="48"
        cy="48"
        r="44"
        strokeWidth=".5"
        strokeDasharray="1 5"
        opacity=".22"
      />
      {(illustrations[kind] ?? illustrations.vivah).map((d, i) => (
        <motion.path
          key={d}
          d={d}
          style={{ pathLength: draw }}
          strokeWidth={i === 0 ? 1.15 : 0.85}
          opacity={i < 2 ? 1 : 0.75}
        />
      ))}
    </svg>
  );
}
