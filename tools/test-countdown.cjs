const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const code = ts.transpileModule(
  fs.readFileSync("src/utils/countdown.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
const sandbox = { exports: {}, Intl, Date };
vm.runInNewContext(code, sandbox);
const { weddingTarget, countdownAt } = sandbox.exports;
const config = {
  year: 2026,
  month: 11,
  day: 2,
  dateLabel: "02 November",
  time: null,
  timezone: "Asia/Kolkata",
  todayMessage: "Today",
  pastMessage: "Past",
};
assert.equal(weddingTarget(config), Date.parse("2026-11-01T18:30:00Z"));
assert.equal(
  weddingTarget({ ...config, time: "18:30" }),
  Date.parse("2026-11-02T13:00:00Z"),
);
assert.equal(
  countdownAt(Date.parse("2026-11-01T18:29:59Z"), config).seconds,
  1,
);
assert.equal(
  countdownAt(Date.parse("2026-11-01T18:30:00Z"), config).kind,
  "today",
);
assert.equal(
  countdownAt(Date.parse("2026-11-02T18:29:59Z"), config).kind,
  "today",
);
assert.equal(
  countdownAt(Date.parse("2026-11-02T18:30:00Z"), config).kind,
  "past",
);
assert.equal(
  countdownAt(Date.parse("2026-11-01T18:30:00Z"), { ...config, time: "18:30" })
    .kind,
  "counting",
);
for (const broken of [
  { year: null },
  { time: "25:00" },
  { month: 2, day: 30 },
  { timezone: "invalid" },
  { year: NaN },
])
  assert.equal(
    countdownAt(Date.now(), { ...config, ...broken }).kind,
    "awaiting",
  );
const far = countdownAt(Date.parse("2026-09-16T00:00:00Z"), config);
assert.equal(far.days, 46);
assert.equal(far.hours, 18);
assert.equal(far.minutes, 30);
console.log(
  "Countdown: zone conversion, unknown config, exact boundary, today, past, ceremony time and invalid targets passed.",
);
