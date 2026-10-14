const WORK = process.env.WORK;
const OUT = process.env.OUT;
const { chromium } = require('playwright-core');
const fs = require('fs');
const FRAMES = [
  ['01-today', 'Your gym buddy <em>levels up</em> with you', 'Streaks, readiness and today’s session'],
  ['02-workout', 'Your coach sets <em>every weight</em>', 'Hit every rep and Kong adds a little next time'],
  ['03-plan', 'A plan built for you in <em>5 questions</em>', 'Strength, muscle or fitness, 2 to 6 days a week'],
  ['04-board', 'Claim <em>#1</em> at your gym', 'Post a video of your lift and take the top spot'],
  ['05-recap', 'Weekly notes from <em>your coach</em>', 'What went well and when to ease off'],
  ['06-progress', 'Watch every lift <em>climb</em>', 'Estimated max and records for every lift'],
  ['07-history', 'Every set, rep and <em>record</em>', 'Your full log, volume and calorie estimates'],
  ['08-squad', 'Collect <em>14 gym buddies</em>', 'Earn gems for workouts, PRs and streaks'],
];
const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(`${WORK}/fonts/${f}`).toString('base64')})`;
const css = `
@font-face{font-family:Nunito;font-weight:900;src:${font('nunito/package/files/nunito-latin-900-normal.woff2')}}
@font-face{font-family:Inter;font-weight:500;src:${font('inter/package/files/inter-latin-500-normal.woff2')}}
@font-face{font-family:Inter;font-weight:600;src:${font('inter/package/files/inter-latin-600-normal.woff2')}}
*{margin:0;box-sizing:border-box}
body{width:1320px;height:2868px;overflow:hidden;background:#09090B;position:relative;font-family:Inter}
.glow{position:absolute;inset:0;background:radial-gradient(900px 700px at 50% 380px,rgba(198,255,61,.16),transparent 70%)}
.cap{position:absolute;top:110px;height:540px;left:90px;right:90px;text-align:center;display:flex;flex-direction:column;justify-content:center}
h1{text-wrap:balance;font-family:Nunito;font-weight:900;font-size:112px;line-height:1.04;letter-spacing:-2px;color:#FAFAFA}
h1 em{font-style:normal;color:#C6FF3D}
p{margin-top:34px;font-weight:500;font-size:48px;line-height:1.3;color:#A1A1AA}
.phone{position:absolute;left:100px;top:700px;width:1120px;height:2400px;border-radius:160px;background:#1F1F23;padding:18px;box-shadow:0 0 0 4px #2E2E33,0 40px 120px rgba(0,0,0,.6)}
.screen{width:100%;height:100%;border-radius:142px;overflow:hidden;background:#09090B;position:relative}
.status{height:153px;display:flex;align-items:center;justify-content:space-between;padding:22px 96px 0 118px;color:#fff;font-weight:600;font-size:46px}
.island{position:absolute;top:30px;left:50%;transform:translateX(-50%);width:300px;height:88px;border-radius:44px;background:#000}
.icons{display:flex;gap:18px;align-items:center}
.shot{width:100%;display:block}
`;
const status = `<div class="status"><span>9:41</span><div class="icons">
<svg width="52" height="32" viewBox="0 0 17 11"><g fill="#fff"><rect x="0" y="7" width="3" height="4" rx=".7"/><rect x="4.5" y="5" width="3" height="6" rx=".7"/><rect x="9" y="2.5" width="3" height="8.5" rx=".7"/><rect x="13.5" y="0" width="3" height="11" rx=".7"/></g></svg>
<svg width="46" height="34" viewBox="0 0 15 11"><path fill="#fff" d="M7.5 2.2c2.1 0 4 .8 5.4 2.1l1.1-1.1C12.3 1.6 10 .6 7.5.6S2.7 1.6 1 3.2l1.1 1.1C3.5 3 5.4 2.2 7.5 2.2zm0 3.1c1.2 0 2.3.5 3.2 1.2l1.1-1.1C10.7 4.4 9.2 3.7 7.5 3.7S4.3 4.4 3.2 5.4l1.1 1.1c.9-.7 2-1.2 3.2-1.2zm0 3c-.5 0-1 .2-1.3.5L7.5 10l1.3-1.2c-.3-.3-.8-.5-1.3-.5z"/></svg>
<svg width="80" height="38" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.2" fill="#fff"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2z" fill="#fff" fill-opacity=".5"/></svg>
</div></div>`;
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1320, height: 2868 } });
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, title, sub] of FRAMES) {
    const img = `data:image/png;base64,${fs.readFileSync(`${WORK}/final/${name}.png`).toString('base64')}`;
    await page.setContent(`<style>${css}</style><div class="glow"></div><div class="cap"><h1>${title}</h1><p>${sub}</p></div>
      <div class="phone"><div class="screen"><div class="island"></div>${status}<img class="shot" src="${img}"></div></div>`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/${name}.png` });
  }
  const imgs = FRAMES.map(
    ([n]) => `<img src="data:image/png;base64,${fs.readFileSync(`${OUT}/${n}.png`).toString('base64')}">`,
  ).join('');
  await page.setViewportSize({ width: 2680, height: 1460 });
  await page.setContent(
    `<style>body{margin:0;background:#333;display:flex;flex-wrap:wrap;gap:20px;padding:20px}img{width:310px}</style>${imgs}`,
  );
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${WORK}/contact.png` });
  await browser.close();
})();
