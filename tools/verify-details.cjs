const { chromium } = require('C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

const ARTIFACT_DIR = 'C:/Users/Ayush/.gemini/antigravity/brain/492dff2e-f471-45da-bbac-9cb55c6cc1ff';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const viewports = [
    { name: 'iphone14-390', width: 390, height: 844 },
    { name: 'iphone14pro-393', width: 393, height: 852 },
    { name: 'iphone15promax-430', width: 430, height: 932 },
    { name: 'desktop-1440', width: 1440, height: 1000 }
  ];

  for (const vp of viewports) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Tap the seal to open invitation' }).click();
    await page.locator('[data-envelope-state=opened]').waitFor();

    // Disable smooth scroll for immediate testing jumps
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.documentElement.style.scrollSnapType = 'none';
    });

    // 1. Verify "Motion on" button is completely removed
    const motionControlCount = await page.locator('.motion-control').count();
    assert.equal(motionControlCount, 0, 'Must NOT contain .motion-control element');
    const motionOnButtons = await page.getByRole('button', { name: /motion/i }).count();
    assert.equal(motionOnButtons, 0, 'Must NOT contain any motion toggle button');

    // 2. Check horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, `Page must not horizontally overflow on ${vp.name}`);

    // Scroll to journey section
    await page.locator('#journey').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Verify all 4 ceremony stops on timeline
    const stops = page.locator('.journey-stop');
    const stopCount = await stops.count();
    assert.equal(stopCount, 4, 'Must have exactly 4 ceremony stops');

    // Verify Mata Ki Chowki
    const mataStop = stops.nth(0);
    const mataText = await mataStop.innerText();
    assert.ok(mataText.includes('Mata Ki Chowki'), 'Mata title missing');
    assert.ok(mataText.includes('30 OCTOBER 2026'), 'Mata full date missing');
    assert.ok(mataText.includes('Jyoti Prajavalan — 3:00 PM'), 'Mata Jyoti timing missing');
    assert.equal(mataText.includes('Hindi invitation'), false, 'Mata must NOT contain Hindi note');
    assert.equal(mataText.includes('3:30 PM'), false, 'Mata must NOT contain 3:30 PM');
    assert.ok(mataText.includes('Dinner — 7:00 PM onwards'), 'Mata dinner missing');
    assert.ok(mataText.includes('Family Residence'), 'Mata venue missing');
    assert.ok(mataText.includes('Village & Post Rudrapur'), 'Mata address missing');
    assert.ok(mataText.includes('Discover the celebration'), 'Mata action missing');

    // Verify Mehandi & Cocktail
    const mehandiStop = stops.nth(1);
    const mehandiText = await mehandiStop.innerText();
    assert.ok(mehandiText.includes('Mehandi & Cocktail'), 'Mehandi title missing');
    assert.ok(mehandiText.includes('31 OCTOBER 2026'), 'Mehandi full date missing');
    assert.ok(mehandiText.includes('7:00 PM onwards'), 'Mehandi timing missing');
    assert.ok(mehandiText.includes('Followed by Dinner'), 'Mehandi dinner missing');
    assert.equal(mehandiText.includes('INVITED BY'), false, 'Mehandi must NOT contain INVITED BY');
    assert.equal(mehandiText.includes('Ansh & Manika'), false, 'Mehandi must NOT contain Ansh & Manika');
    assert.equal(mehandiText.includes('DRESS CODE'), false, 'Mehandi must NOT contain DRESS CODE');
    assert.equal(mehandiText.includes('Bring your dancing shoes'), false, 'Mehandi must NOT contain dancing shoes');
    assert.equal(mehandiText.includes('HOSTED BY'), false, 'Mehandi must NOT contain HOSTED BY');
    assert.equal(mehandiText.includes('Yash Verma'), false, 'Mehandi must NOT contain Yash Verma');
    assert.equal(mataText.includes('HOSTED BY'), false, 'Mata must NOT contain HOSTED BY');
    assert.equal(mataText.includes('Sangeeta'), false, 'Mata must NOT contain Sangeeta');

    // Verify Haldi Hath & Mangal Snan
    const haldiStop = stops.nth(2);
    const haldiText = await haldiStop.innerText();
    assert.ok(haldiText.includes('Haldi Hath & Mangal Snan'), 'Haldi title missing');
    assert.ok(haldiText.includes('01 NOVEMBER 2026'), 'Haldi full date missing');
    assert.ok(haldiText.includes('Haldi Hath — 9:00 AM'), 'Haldi Hath timing missing');
    assert.equal(haldiText.includes('Hindi invitation'), false, 'Haldi Hath note must be absent');
    assert.ok(haldiText.includes('Mangal Snan — 10:00 AM'), 'Mangal Snan timing missing');
    assert.equal(haldiText.includes('11:00 AM'), false, 'Mangal Snan note must be absent');
    assert.ok(haldiText.includes('Preetibhoj / Lunch — 1:00 PM'), 'Lunch timing missing');
    assert.equal(haldiText.includes('12:00 PM'), false, 'Lunch note must be absent');

    // Verify Vivah Sanskar
    const vivahStop = stops.nth(3);
    const vivahText = await vivahStop.innerText();
    assert.ok(vivahText.includes('Vivah Sanskar'), 'Vivah title missing');
    assert.ok(vivahText.includes('02 NOVEMBER 2026'), 'Vivah full date missing');
    assert.ok(vivahText.includes('Mandha Poojan — 10:00 AM'), 'Mandha Poojan missing');
    assert.ok(vivahText.includes('Sehrabandi — 4:00 PM'), 'Sehrabandi missing');
    assert.ok(vivahText.includes('Barat Departure — 6:00 PM'), 'Barat departure missing');
    assert.equal(vivahText.includes('Hindi invitation'), false, 'Barat departure note missing');
    assert.equal(vivahText.includes('5:00 PM'), false, 'Vivah must NOT contain 5:00 PM');
    assert.ok(vivahText.includes('Dinner — 8:00 PM'), 'Dinner missing');
    assert.ok(vivahText.includes('Vivah Sanskar — Shubh Lagnanusar'), 'Lagnanusar missing');
    assert.ok(vivahText.includes('BARAT ROUTE'), 'Barat route label missing');
    assert.ok(vivahText.includes('Family Residence, Rudrapur'), 'Barat route origin missing');
    assert.ok(vivahText.includes('Opp. S.G.R.R. Inter College, Bhauwala'), 'Barat route stop missing');
    assert.ok(vivahText.includes('Sharma Farms'), 'Barat route dest missing');
    assert.ok(vivahText.includes('MAIN VENUE'), 'Main venue label missing');
    assert.ok(vivahText.includes('SHARMA FARMS'), 'Main venue name missing');

    // Verify alignment of node and heading h3
    const alignmentCheck = await page.evaluate(() => {
      const stops = Array.from(document.querySelectorAll('.journey-stop'));
      return stops.map((stop, i) => {
        const h3 = stop.querySelector('h3');
        const node = stop.querySelector('.journey-node-dot');
        const h3Rect = h3.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        const h3MidY = h3Rect.top + h3Rect.height / 2;
        const nodeMidY = nodeRect.top + nodeRect.height / 2;
        return { index: i, diffY: Math.abs(h3MidY - nodeMidY) };
      });
    });
    console.log('Node to heading vertical alignment diffs (px):', alignmentCheck);
    for (const a of alignmentCheck) {
      assert.ok(a.diffY <= 4, `Node and heading must be vertically aligned within 4px (was ${a.diffY}px)`);
    }

    // Verify left/right alternation text alignment
    const alignments = await page.evaluate(() => {
      const stops = Array.from(document.querySelectorAll('.journey-stop'));
      return stops.map(stop => {
        const copy = stop.querySelector('.journey-copy');
        return getComputedStyle(copy).textAlign;
      });
    });
    console.log('Text alignments across stops:', alignments);
    assert.equal(alignments[0], 'left', 'Stop 0 (Mata) must be left-aligned');
    assert.equal(alignments[1], 'right', 'Stop 1 (Mehandi) must be right-aligned');
    assert.equal(alignments[2], 'left', 'Stop 2 (Haldi) must be left-aligned');
    assert.equal(alignments[3], 'right', 'Stop 3 (Vivah) must be right-aligned');

    // Verify large ceremony pages
    for (const id of ['mata', 'mehendi', 'haldi', 'vivah']) {
      const scene = page.locator(`#${id}`);
      const text = await scene.innerText();
      assert.ok(text.length > 50, `Ceremony scene #${id} must contain content`);

      // Verify no Hindi invitation notes
      assert.equal(text.includes('Hindi invitation'), false, `${id} must NOT contain Hindi invitation note`);

      // Verify no Add to calendar
      assert.equal(text.includes('calendar'), false, `${id} must NOT contain calendar`);
      assert.equal(text.includes('Add to calendar'), false, `${id} must NOT contain Add to calendar`);
      assert.equal(text.includes('＋ Add to calendar'), false, `${id} must NOT contain ＋ Add to calendar`);

      // Verify View location is present
      const locationLink = scene.locator('.event-actions a');
      const locationCount = await locationLink.count();
      assert.equal(locationCount, 1, `${id} must have exactly 1 location link`);
      const linkText = await locationLink.innerText();
      assert.ok(linkText.includes('View location'), `${id} link must be View location`);

      if (id === 'mata') {
        assert.ok(text.includes('Jyoti Prajavalan') && text.includes('3:00 PM') && text.includes('Dinner'));
        assert.equal(text.includes('3:30 PM'), false);
      } else if (id === 'mehendi') {
        assert.ok(text.includes('7:00 PM onwards') && text.includes('Followed by Dinner'));
      } else if (id === 'haldi') {
        assert.ok(text.includes('Haldi Hath') && text.includes('9:00 AM') && text.includes('Mangal Snan') && text.includes('10:00 AM') && text.includes('Preetibhoj / Lunch') && text.includes('1:00 PM'));
        assert.equal(text.includes('11:00 AM'), false);
        assert.equal(text.includes('12:00 PM'), false);
      } else if (id === 'vivah') {
        assert.ok(text.includes('Mandha Poojan') && text.includes('10:00 AM') && text.includes('Sehrabandi') && text.includes('4:00 PM') && text.includes('Barat Departure') && text.includes('6:00 PM') && text.includes('Dinner') && text.includes('8:00 PM') && text.includes('Vivah Sanskar') && text.includes('Shubh Lagnanusar'));
        assert.equal(text.includes('5:00 PM'), false);
        assert.ok(text.includes('BARAT ROUTE') && text.includes('SHARMA FARMS'));
      }
    }

    // Take screenshots on 393px mobile
    if (vp.name === 'iphone14pro-393') {
      await mataStop.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${ARTIFACT_DIR}/timeline_mata_ki_chowki.png` });

      await mehandiStop.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${ARTIFACT_DIR}/timeline_mehandi_cocktail.png` });

      await haldiStop.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${ARTIFACT_DIR}/timeline_haldi_snan.png` });

      await vivahStop.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${ARTIFACT_DIR}/timeline_vivah_sanskar.png` });

      // Ceremony pages screenshots
      await page.locator('#mata').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${ARTIFACT_DIR}/ceremony_mata_scene.png` });

      await page.locator('#mehendi').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${ARTIFACT_DIR}/ceremony_mehendi_scene.png` });

      await page.locator('#haldi').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${ARTIFACT_DIR}/ceremony_haldi_scene.png` });

      await page.locator('#vivah').scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${ARTIFACT_DIR}/ceremony_vivah_scene.png` });
    }

    assert.deepEqual(errors, [], 'There should be zero page errors');
    console.log(`? Viewport ${vp.name} passed all assertions cleanly.`);
    await page.close();
  }

  await browser.close();
  console.log('\n? ALL TIMELINE & CEREMONY VERIFICATIONS PASSED SUCCESSFULLY!');
})().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
