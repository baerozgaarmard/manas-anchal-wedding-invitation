const {chromium}=require('C:/Users/Ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:"chrome"});const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5174/');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'tools/mobile-opening.png'});for(const id of ['envelope','invitation','journey','mata','mehendi','haldi','vivah','rsvp']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(2000);await page.screenshot({path:`tools/mobile-${id}.png`})}console.log(JSON.stringify({errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));await browser.close()})();



