const assert = require('node:assert/strict');
const { chromium } = require('C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const [width, height] of [[390,844],[393,852],[430,932],[768,1024],[1440,1000]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5174');
    await page.locator('.letter-wax').click();
    await page.locator('[data-envelope-state="opened"]').waitFor();
    await page.getByRole('button', {name:'Tap to reveal our wedding date',exact:true}).click();
    await page.locator('#countdown').waitFor();
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    const bottom = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (const direction of [1, -1]) {
      for (let step = 0; step <= 20; step++) {
        const y = bottom * (direction === 1 ? step / 20 : 1 - step / 20);
        await page.evaluate(y => window.scrollTo({top:y,behavior:'instant'}), y);
        await page.waitForTimeout(45);
      }
    }
    const bounds = await page.locator('.journey-path').evaluate(e => ({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight}));
    const move = async y => { await page.evaluate(y => window.scrollTo({top:y,behavior:'instant'}),y); await page.waitForTimeout(550); };
    const pathProgress = () => page.locator('.journey-drawn-path').evaluate(e => parseFloat(e.getAttribute('stroke-dasharray')));
    await move(bounds.top + bounds.height - height * .7);
    const full = await pathProgress();
    await move(bounds.top - height * .7);
    const back = await pathProgress();
    assert(full > .8 && back < .1, `Timeline must reverse: ${full} -> ${back}`);
    for (const id of ['mata','mehendi','haldi','vivah','closing','family-sign-off']) {
      const scene = page.locator('#'+id);
      await scene.scrollIntoViewIfNeeded();
      await page.waitForTimeout(550);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (['mata','mehendi','haldi','vivah'].includes(id)) {
        const metrics = await scene.evaluate(e => {
          const a=e.querySelector('.event-actions').getBoundingClientRect(), r=e.getBoundingClientRect();
          return {fits:a.bottom<=r.bottom,opacity:parseFloat(getComputedStyle(e.querySelector('.ceremony-copy')).opacity),font:parseFloat(getComputedStyle(e.querySelector('.ceremony-venue-addr')).fontSize)};
        });
        assert(metrics.fits && metrics.opacity > .75 && metrics.font >= 14, JSON.stringify({id,metrics}));
      }
      await scene.screenshot({path:`tools/quality-${width}-${id}.png`});
    }
    assert.deepEqual(errors, []);
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('#mata .petals').evaluate(e=>getComputedStyle(e).display),'none');
    console.log(`${width}x${height}: forward/back traversal, reversing path, readable details, contained actions, no overflow/errors, reduced motion passed`);
    await page.close();
  }
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
