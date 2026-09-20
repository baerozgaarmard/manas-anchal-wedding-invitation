const assert = require('node:assert/strict');
const { chromium, webkit } = require('C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

// Includes a shorter viewport for the space occupied by mobile browser controls.
const sizes = [[390, 844], [393, 852], [430, 932], [393, 680]];
const url = process.env.QA_URL || 'http://127.0.0.1:5174';

(async () => {
  for (const [name, engine] of [['chrome', chromium], ['webkit', webkit]]) {
    const browser = await engine.launch(name === 'chrome' ? { channel: 'chrome' } : {});
    try {
      for (const [width, height] of sizes) {
        const page = await browser.newPage({
          viewport: { width, height }, isMobile: true, hasTouch: true,
        });
        await page.goto(url);
        await page.locator('.letter-wax').click();
        await page.waitForTimeout(2400);
        await page.evaluate(() => document.fonts.ready);
        // Approach and leave the same boundary in both directions.
        for (const offset of [-180, 80, -180, 0]) {
          await page.locator('#vivah').evaluate((scene, offset) => {
            window.scrollTo(0, scene.offsetTop + offset);
          }, offset);
          await page.waitForTimeout(300);
          const geometry = await page.locator('#vivah').evaluate(scene => {
            const copy = scene.querySelector('.ceremony-copy');
            const artwork = scene.querySelector('.scene-art').getBoundingClientRect();
            const copyBounds = copy.getBoundingClientRect();
            const outgoing = getComputedStyle(document.querySelector('#haldi > .chapter-bridge'));
            const incoming = getComputedStyle(scene.querySelector('.chapter-entry-veil'));
            const text = [...copy.querySelectorAll('p, h2, a, .ceremony-entry-line, .ceremony-waypoint-name')]
              .map(element => element.getBoundingClientRect());
            return {
              overflow: document.documentElement.scrollWidth > innerWidth,
              // The mandap starts near 55% of the original image; reserve extra sky.
              mandapClearance: artwork.top + artwork.height * .53 - copyBounds.bottom,
              textInsideArtwork: copyBounds.top >= artwork.top + 10,
              safeWidth: text.every(rect => rect.left >= 28 && rect.right <= innerWidth - 28),
              columnHeight: copyBounds.height - parseFloat(getComputedStyle(copy).paddingTop),
              fadeOpacity: [outgoing.opacity, incoming.opacity],
              fadeHeights: [outgoing.height, incoming.height],
              fadeColors: [outgoing.backgroundImage, incoming.backgroundImage],
            };
          });
          assert.equal(geometry.overflow, false);
          assert.equal(geometry.safeWidth, true, 'Text must stay within the narrow safe column');
          assert.equal(geometry.textInsideArtwork, true, 'Even the title must sit inside the marked artwork sky');
          assert.ok(geometry.mandapClearance >= 20, 'The entire text block must end above the mandap');
          assert.ok(geometry.columnHeight < 290, 'The entire invitation block must fit the marked region');
          assert.deepEqual(geometry.fadeOpacity, ['1', '1']);
          assert.deepEqual(geometry.fadeHeights, ['64px', '48px']);
          assert.ok(geometry.fadeColors.every(color => color.includes('rgb(234, 211, 187)')));
        }
        await page.close();
        console.log(`${name} ${width}x${height}: safe text, clear mandap, matching reversible boundary`);
      }
    } finally {
      await browser.close();
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
