import assert from 'node:assert/strict';
// Use an existing Puppeteer install; no application dependency needed.
// PUPPETEER_MODULE=/path/to/node_modules/puppeteer-core node scripts/check-second.mjs
import { createRequire } from 'node:module';
const puppeteer = createRequire(import.meta.url)(process.env.PUPPETEER_MODULE || 'puppeteer-core');
const browser = await puppeteer.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try {
for (const [width,height,reduced] of [[390,844,false],[1440,900,false],[320,740,true]]) {
 const page=await browser.newPage();
 await page.setViewport({width,height,isMobile:width<600,hasTouch:width<600});
 if(reduced) await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${process.env.BASE_URL || 'http://localhost:3001'}/second`,{waitUntil:'networkidle2'});
 await new Promise(r=>setTimeout(r,1800));
 const video=await page.$('.hero-media video');
 const state=await video.evaluate(v=>({src:v.getAttribute('src'),ready:v.readyState}));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(reduced) assert.equal(state.src,null);
 else {
   assert.ok(state.src.includes(width<600?'portrait.mp4':'hero.mp4'));
   await page.click('button[aria-label="توقف ویدیوی پس‌زمینه"]');
   assert.equal(await video.evaluate(v=>v.paused),true);
   await video.evaluate(v=>{v.currentTime=17.5});
   await new Promise(r=>setTimeout(r,700));
 }
 await page.screenshot({path:`/tmp/steach-second-${width}.png`});
 if(width<1024){
   await page.click('[popovertarget="main-menu"]');
   assert.ok(await page.$('#main-menu:popover-open'));
   await page.click('#main-menu a[href="#method"]');
   assert.equal(await page.$('#main-menu:popover-open'),null);
   await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,0)});
 }
 const trigger='button[aria-label="پخش ویدیو: پلی‌تاک چیه؟"]';
 await page.click(trigger);
 await new Promise(r=>setTimeout(r,1000));
 assert.ok(await page.$('dialog[open] video'));
 await page.keyboard.press('Escape');
 await new Promise(r=>setTimeout(r,400));
 assert.equal(await page.$('dialog[open]'),null);
 const levels=await page.$('#levels details');
 await levels.$eval('summary',s=>s.click());
 assert.equal(await levels.evaluate(d=>d.open),true);
 await page.$eval('#town-tab-0',b=>b.focus());
 await page.keyboard.press('ArrowLeft');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'town-tab-1');
 await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.body.scrollHeight)});
 await new Promise(r=>setTimeout(r,500));
 assert.equal(await page.$eval('.to-top',a=>getComputedStyle(a).position),'fixed');
 assert.equal(errors.length,0,errors.join('\n'));
 console.log(`${width}: source=${state.src}, overflow/menu/dialog/levels/tabs/back-to-top OK`);
 await page.close();
}
} finally {await browser.close()}
