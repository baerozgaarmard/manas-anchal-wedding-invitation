const {
  chromium,
} = require("C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({ headless: true, channel: "chrome" });
  const p = await b.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  await p.goto("http://127.0.0.1:5174");
  assert.equal(await p.locator("main > #envelope").count(), 1);
  assert.equal(await p.locator(".opening,#invitation").count(), 0);
  assert.equal(
    await p
      .locator("#envelope")
      .evaluate((e) => Math.round(e.getBoundingClientRect().height)),
    844,
  );
  await p.evaluate(() => {
    window.envelopeStates = [];
    new MutationObserver(() =>
      window.envelopeStates.push(
        document.querySelector("#envelope").dataset.envelopeState,
      ),
    ).observe(document.querySelector("#envelope"), {
      attributes: true,
      attributeFilter: ["data-envelope-state"],
    });
  });
  const seal = p.getByRole("button", {
    name: "Tap the seal to open invitation",
  });
  await seal.tap();
  await p.evaluate(() => document.querySelector(".letter-wax").click());
  await p.mouse.wheel(0, 700);
  await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => scrollY), 0);
  assert.equal(await p.locator(".letter-content").getAttribute("inert"), "");
  await p.locator("[data-envelope-state=opened]").waitFor();
  assert.deepEqual(await p.evaluate(() => window.envelopeStates), [
    "breaking",
    "opening",
    "revealing",
    "opened",
  ]);
  assert.equal(await p.evaluate(() => scrollY), 0);
  assert.equal(
    await p.evaluate(() => document.documentElement.style.overflow),
    "",
  );
  assert.equal(await p.locator(".letter-wax").count(), 0);
  assert.equal(await p.locator("iframe").count(), 1);
  assert.equal(await p.locator(".map-awaiting").count(), 0);
  assert.match(
    await p.locator("iframe").getAttribute("src"),
    /2478930000041440583/,
  );
  await p.close();
  const map = await b.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await map.route("https://www.google.com/maps/embed?invitation-test", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<button onclick=\"this.textContent='Map interaction verified'\">Pan map</button>",
    }),
  );
  await map.goto("http://127.0.0.1:5174");
  await map.evaluate(async () => {
    const { weddingData } = await import("/src/data/weddingData.ts");
    weddingData.location = {
      venue: "Test venue",
      address: "Test address",
      embedUrl: "https://www.google.com/maps/embed?invitation-test",
      googleMapsUrl: "https://maps.google.com/?q=test",
    };
  });
  await map
    .getByRole("button", { name: "Tap the seal to open invitation" })
    .click();
  await map.locator("[data-envelope-state=opened]").waitFor();
  await map.locator(".map-stationery").scrollIntoViewIfNeeded();
  await map
    .frameLocator("iframe")
    .getByRole("button", { name: "Pan map" })
    .click();
  await map
    .frameLocator("iframe")
    .getByText("Map interaction verified")
    .waitFor();
  assert.equal(await map.locator(".map-awaiting").count(), 0);
  const link = map.getByRole("link", { name: "Open in Google Maps" });
  assert.equal(await link.getAttribute("target"), "_blank");
  assert.match(await link.getAttribute("rel"), /noopener/);
  console.log(
    "Envelope sequence, duplicate tap guard, scroll lock/release, same-position reveal, configured map embed interaction and directions link passed.",
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
