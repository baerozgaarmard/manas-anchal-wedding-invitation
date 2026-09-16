const {
  chromium,
} = require("C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("node:assert/strict");
const base = "http://127.0.0.1:5174/";
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const results = [];
  for (const [width, height, dpr] of [
    [390, 844, 3],
    [393, 852, 3],
    [430, 932, 2],
    [1440, 1000, 1],
  ]) {
    const p = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      hasTouch: width < 800,
    });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(base);
    await p.evaluate(() => document.fonts.ready);
    assert.equal(await p.locator("form,input,textarea").count(), 0);
    const seal = p.getByRole("button", {
      name: "Tap the seal to open invitation",
    });
    await seal.click();
    await p.locator("[data-envelope-state=opened]").waitFor();
    assert.equal(
      await p
        .locator("#envelope")
        .evaluate((e) => e.getBoundingClientRect().top),
      0,
    );
    await p.locator("#scratch-date").scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
    const surface = p.locator(".scratch-canvas");
    await surface.waitFor({ state: "visible" });
    const box = await surface.boundingBox();
    const initial = await surface.evaluate(
      (c) =>
        Array.from(
          c.getContext("2d").getImageData(c.width / 2, c.height / 2, 1, 1).data,
        )[3],
    );
    assert.equal(initial, 255);
    if (width === 390) await p.screenshot({ path: "tools/scratch-before.png" });
    await p.mouse.move(box.x + box.width / 2, box.y + 100);
    await p.mouse.down();
    await p.mouse.move(box.x + box.width / 2 + 30, box.y + 120, { steps: 8 });
    await p.mouse.up();
    assert.equal(await p.locator(".date-discovered").count(), 0);
    assert.equal(await p.locator(".scratch-gesture").count(), 0);
    const beforeScroll = await p.evaluate(() => scrollY);
    await p.mouse.move(box.x + 20, box.y + 60);
    await p.mouse.down();
    for (let i = 0; i < 9; i++) {
      await p.mouse.move(
        box.x + (i % 2 ? 20 : box.width - 20),
        box.y + 60 + i * 24,
        { steps: 20 },
      );
      if (await p.locator(".date-discovered").count()) break;
    }
    await p.mouse.up();
    await p.locator(".date-discovered").waitFor();
    await p.waitForTimeout(2000);
    assert.ok(
      Math.abs((await p.evaluate(() => scrollY)) - beforeScroll) < 3,
      "no forced scroll",
    );
    assert.equal(
      await surface.evaluate((c) => getComputedStyle(c.parentElement).opacity),
      "0",
    );
    if (width === 390) await p.screenshot({ path: "tools/scratch-after.png" });
    await p.locator("#countdown").waitFor();
    await p.locator("#countdown").scrollIntoViewIfNeeded();
    await p.locator(".countdown-values").waitFor();
    await p.waitForTimeout(1000);
    const a = await p.locator(".countdown-unit").last().innerText();
    await p.waitForTimeout(1200);
    const b = await p.locator(".countdown-unit").last().innerText();
    assert.notEqual(a, b, "live seconds");
    if (width === 390)
      await p.screenshot({ path: "tools/countdown-mobile.png" });
    if (width === 1440)
      await p.screenshot({ path: "tools/countdown-desktop.png" });
    const overflow = await p.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false);
    assert.deepEqual(errors, []);
    results.push({
      width,
      height,
      dpr,
      physicalScratch: true,
      autoReveal: true,
      noForcedScroll: true,
      liveSeconds: true,
      overflow,
      errors,
    });
    await p.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await reduced.goto(base);
  await reduced
    .getByRole("button", { name: "Tap the seal to open invitation" })
    .click();
  await reduced.locator("[data-envelope-state=opened]").waitFor();
  await reduced.locator("#scratch-date").scrollIntoViewIfNeeded();
  await reduced
    .getByRole("button", { name: "Tap to reveal our wedding date" })
    .focus();
  await reduced.keyboard.press("Enter");
  await reduced.locator(".date-discovered").waitFor();
  assert.equal(
    await reduced
      .locator(".reveal-petals")
      .evaluate((e) => getComputedStyle(e).display),
    "none",
  );
  results.push({ reducedMotionKeyboardReveal: true });
  await reduced.close();
  const failed = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await failed.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await failed.goto(base);
  await failed
    .getByRole("button", { name: "Tap the seal to open invitation" })
    .click();
  await failed.locator("[data-envelope-state=opened]").waitFor();
  await failed
    .getByRole("button", { name: "Tap to reveal our wedding date" })
    .click();
  await failed.locator(".date-discovered").waitFor();
  results.push({ canvasFailureFallback: true });
  await failed.close();
  const nojs = await browser.newPage({ javaScriptEnabled: false });
  await nojs.goto(base);
  await nojs.locator("summary").click();
  assert.match(await nojs.locator("details").innerText(), /02 November 2026/);
  results.push({ noJavaScriptFallback: true });
  await nojs.close();
  console.log(JSON.stringify(results));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
