const {
  chromium,
} = require("C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5174/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "tools/mobile-opening.png" });
  await page
    .getByRole("button", { name: "Tap the seal to open invitation" })
    .click();
  await page.locator("[data-envelope-state=opened]").waitFor();
  await page
    .getByRole("button", { name: "Tap to reveal our wedding date" })
    .click();
  await page.waitForTimeout(2000);
  for (const id of [
    "scratch-date",
    "countdown",
    "journey",
    "mata",
    "mehendi",
    "haldi",
    "vivah",
    "closing",
  ]) {
    await page
      .locator("#" + id)
      .evaluate((e) =>
        e.scrollIntoView({ block: "start", behavior: "instant" }),
      );
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `tools/mobile-${id}.png` });
  }
  await page
    .locator(".ending-location")
    .evaluate((e) => e.scrollIntoView({ block: "start", behavior: "instant" }));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: "tools/mobile-venue.png" });
  console.log(
    JSON.stringify({
      errors,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    }),
  );
  await browser.close();
})();
