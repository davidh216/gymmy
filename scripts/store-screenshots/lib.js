const { chromium } = require('playwright-core');
const seed = require('./seed');
const BASE = 'http://localhost:8130';
const FACES =
  [400, 500, 600, 700, 800, 900]
    .map((w) => `@font-face{font-family:Inter;font-weight:${w};src:url(/fonts/inter-latin-${w}-normal.woff2)}`)
    .join('') +
  [600, 700, 800, 900]
    .map((w) => `@font-face{font-family:Nunito;font-weight:${w};src:url(/fonts/nunito-latin-${w}-normal.woff2)}`)
    .join('');
// iPhone shows SF Pro and SF Rounded; Inter and Nunito are the closest free stand-ins.
async function fixFonts(page) {
  await page.evaluate((faces) => {
    if (!document.getElementById('shot-fonts')) {
      const st = document.createElement('style');
      st.id = 'shot-fonts';
      st.textContent = faces + 'html,body,div,input{font-family:Inter}';
      document.head.appendChild(st);
    }
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const r of rules) {
        const f = r.style && r.style.fontFamily;
        if (!f || !/system-ui|-apple-system|ui-rounded|sans-serif/.test(f)) continue;
        r.style.fontFamily = /ui-rounded/.test(f) ? 'Nunito' : 'Inter';
      }
    }
  }, FACES);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}
exports.fixFonts = fixFonts;
exports.setup = async ({ scale = 1 } = {}) => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({ viewport: { width: 440, height: 894 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(2026, 9, 15, 17, 32));
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const text = (t) => page.getByText(t, { exact: typeof t === 'string' }).last();
  await page.goto(BASE + '/');
  await page.waitForTimeout(1200);
  await text("Let's go").click();
  await page.getByPlaceholder('Your name').fill('Alex');
  for (let i = 0; i < 4; i++) await text('Continue').click();
  await page.getByTestId('goal-4').click();
  await text('Start with Kong').click();
  await page.getByTestId('today').waitFor();
  await page.goto(BASE + '/plan-generator');
  await page.waitForTimeout(1200);
  await page.getByTestId('gen-goal-muscle').click();
  await page.waitForTimeout(300);
  await page.getByTestId('gen-save').click();
  await page.waitForTimeout(1200);
  const raw = JSON.parse(await page.evaluate(() => localStorage.getItem('gymmy')));
  const program = raw.state.customPrograms[0];
  seed(raw.state, program.id, program);
  await page.evaluate((v) => localStorage.setItem('gymmy', v), JSON.stringify(raw));
  const go = async (path, wait = 1800) => {
    await page.goto(BASE + path);
    await page.waitForTimeout(wait);
  };
  await go('/milestones');
  await text(/^Claim all/).click();
  await page.waitForTimeout(800);
  await go('/gyms', 1200);
  await page.evaluate((now) => {
    const w = JSON.parse(localStorage.getItem('gymmy-gyms-v2'));
    for (const a of Object.values(w.athletes)) a.sample = false;
    w.athletes.me = { id: 'me', username: 'alex', companionId: 'kong' };
    for (const g of w.gyms) g.sample = false;
    w.gyms.find((g) => g.id === 'iron-temple').members.push('me');
    w.entries
      .filter((e) => e.gymId === 'iron-temple')
      .forEach((e, i) => {
        e.videoUri = 'file:///demo.mov';
        e.createdAt = now - (1 + (i % 13)) * 86400000;
      });
    w.entries.push({
      id: 'me-bench',
      gymId: 'iron-temple',
      challengeId: 'bench_1rm',
      userId: 'me',
      value: 255 / 2.20462,
      reps: 8,
      bodyweightKg: 82.5,
      videoUri: 'file:///demo.mov',
      status: 'live',
      createdAt: now - 2 * 86400000,
    });
    localStorage.setItem('gymmy-gyms-v2', JSON.stringify(w));
  }, Date.now());
  await go('/');
  return { browser, page, text, go, errors, program, state: raw.state };
};
