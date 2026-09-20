const assert = require('node:assert/strict');
const { chromium, webkit } = require('C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  for (const [name, engine] of [['chrome', chromium], ['webkit', webkit]]) {
    const browser = await engine.launch(name === 'chrome' ? { channel: 'chrome' } : {});
    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await page.addInitScript(() => {
        const NativeAudioContext = window.AudioContext;
        if (!NativeAudioContext) return;
        window.AudioContext = class extends NativeAudioContext {
          constructor(...args) { super(...args); window.testMusicContext = this; }
          createGain() { const gain = super.createGain(); window.testMusicGain = gain; return gain; }
        };
      });
      await page.goto(process.env.QA_URL || 'http://127.0.0.1:5174');
      const state = () => page.evaluate(() => {
        const audio = document.querySelector('audio');
        return { paused: audio.paused, muted: audio.muted, time: audio.currentTime, volume: audio.volume,
          gain: window.testMusicGain?.gain.value, context: window.testMusicContext?.state };
      });
      assert.equal((await state()).paused, true, 'No autoplay before interaction');
      await page.locator('.letter-wax').click();
      await page.waitForFunction(() => document.querySelector('audio').currentTime > .2);
      await page.waitForTimeout(650);
      assert.equal((await state()).paused, false);
      const playing = await state();
      assert.ok((playing.gain ?? playing.volume) > .39);
      // Visibility changes are dispatched explicitly to make lifecycle tests deterministic.
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForTimeout(180);
      let stopped = await state();
      assert.equal(stopped.paused, true);
      assert.equal(stopped.muted, true);
      if (stopped.context) {
        assert.equal(stopped.gain, 0);
        assert.equal(stopped.context, 'suspended');
      }
      await page.evaluate(() => {
        delete document.visibilityState;
        document.dispatchEvent(new Event('visibilitychange'));
      });
      assert.equal((await state()).paused, true, 'Returning must not restart music automatically');
      await page.locator('.audio-control').click();
      await page.waitForTimeout(650);
      assert.equal((await state()).paused, false);
      assert.ok((await state()).time >= stopped.time, 'Resume the existing track timestamp');
      await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
      await page.waitForTimeout(100);
      stopped = await state();
      assert.equal(stopped.paused, true);
      assert.equal(stopped.muted, true);
      if (stopped.context) {
        assert.equal(stopped.gain, 0);
        assert.equal(stopped.context, 'suspended');
      }
      await page.locator('.audio-control').click();
      await page.waitForTimeout(650);
      assert.equal((await state()).paused, false, 'Music remains usable after a restored page');
      await page.locator('.audio-control').click();
      await page.waitForTimeout(650);
      assert.equal((await state()).paused, true, 'Normal fade-off still pauses');
      console.log(`${name}: gesture start, background fade, pagehide silence, resume and toggle passed`);
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
