const {
  chromium,
} = require("C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({ headless: true, channel: "chrome" });
  const p = await b.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  await p.goto("http://127.0.0.1:5174");
  await p
    .getByRole("button", { name: "Tap the seal to open invitation" })
    .click();
  await p.locator("[data-envelope-state=opened]").waitFor();
  await p.locator("#scratch-date").scrollIntoViewIfNeeded();
  await p.waitForTimeout(500);
  const canvas = p.locator(".scratch-canvas");
  const r = await canvas.boundingBox();
  const cdp = await p.context().newCDPSession(p);
  const x = r.x + r.width / 2,
    y = r.y + 100;
  const scroll = await p.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 20, y: y + 45 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  assert.ok(
    Math.abs((await p.evaluate(() => scrollY)) - scroll) < 2,
    "touch did not scroll page",
  );
  const alpha = await canvas.evaluate(
    (c) =>
      c.getContext("2d").getImageData(c.width / 2, (c.height * 100) / 310, 1, 1)
        .data[3],
  );
  assert.ok(alpha < 200, "real touch erased foil");
  await p.setViewportSize({ width: 430, height: 932 });
  await p.waitForTimeout(300);
  const resizedAlpha = await canvas.evaluate(
    (c) =>
      c.getContext("2d").getImageData(c.width / 2, (c.height * 100) / 310, 1, 1)
        .data[3],
  );
  assert.ok(resizedAlpha < 200, "resize preserves scratches");
  const box = await canvas.boundingBox();
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: box.x + 20, y: box.y + 60 }],
  });
  for (let i = 0; i < 10; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: box.x + (i % 2 ? 20 : box.width - 20), y: box.y + 60 + i * 22 },
      ],
    });
    if (await p.locator(".date-discovered").count()) break;
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await p.locator(".date-discovered").waitFor();
  const start = await p.evaluate(() => scrollY);
  await p.mouse.move(10, 700);
  await p.mouse.wheel(0, 450);
  await p.waitForTimeout(800);
  assert.ok(
    (await p.evaluate(() => scrollY)) > start,
    "scroll works after scratch",
  );
  console.log(
    "Real touch emulation: erasing, cancellation, resize persistence, auto-completion and normal scrolling passed.",
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
