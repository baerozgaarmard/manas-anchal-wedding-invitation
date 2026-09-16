import type { WeddingDateConfig } from "../data/weddingData";

export type CountdownState =
  | { kind: "awaiting" | "today" | "past" }
  | {
      kind: "counting";
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };

function zonedParts(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(timestamp);
  const number = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  return {
    year: number("year"),
    month: number("month"),
    day: number("day"),
    hour: number("hour"),
    minute: number("minute"),
    second: number("second"),
  };
}
// Resolve a local wall-clock date in its configured IANA time zone, independent
// of the guest's device time zone. Reject invalid/nonexistent local dates.
export function weddingTarget(config: WeddingDateConfig): number | null {
  if (
    config.year === null ||
    !Number.isInteger(config.year) ||
    config.year < 1900 ||
    config.year > 9999
  )
    return null;
  const time = config.time ?? "00:00";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const [hour, minute] = time.split(":").map(Number);
  const wall = Date.UTC(
    config.year,
    config.month - 1,
    config.day,
    hour,
    minute,
  );
  try {
    let guess = wall;
    for (let i = 0; i < 3; i++) {
      const p = zonedParts(guess, config.timezone);
      guess +=
        wall - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    }
    const check = zonedParts(guess, config.timezone);
    if (
      check.year !== config.year ||
      check.month !== config.month ||
      check.day !== config.day ||
      check.hour !== hour ||
      check.minute !== minute
    )
      return null;
    return guess;
  } catch {
    return null;
  }
}
export function countdownAt(
  now: number,
  config: WeddingDateConfig,
): CountdownState {
  const target = weddingTarget(config);
  if (target === null) return { kind: "awaiting" };
  if (now >= target) {
    const local = zonedParts(now, config.timezone);
    return {
      kind:
        local.year === config.year &&
        local.month === config.month &&
        local.day === config.day
          ? "today"
          : "past",
    };
  }
  const seconds = Math.max(0, Math.ceil((target - now) / 1000));
  return {
    kind: "counting",
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}
