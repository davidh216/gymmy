const WORK = process.env.WORK;
const { setup, fixFonts } = require('./lib');
(async () => {
  const { browser, page, text, go, errors, program, state } = await setup({ scale: 3 });
  const shot = async (n) => {
    await fixFonts(page);
    await page.screenshot({ path: `${WORK}/final/${n}.png` });
  };
  const visit = async (p) => {
    await go(p);
  };
  await visit('/');
  await shot('01-today');
  await visit('/plan-generator');
  await page.getByTestId('gen-goal-muscle').click();
  await page.waitForTimeout(500);
  await shot('03-plan');
  await visit('/board/iron-temple/bench_1rm');
  await shot('04-board');
  await visit('/recap');
  await shot('05-recap');
  await visit('/exercise/bench_press');
  await shot('06-progress');
  await visit('/history');
  await shot('07-history');
  await visit('/squad');
  await shot('08-squad');
  await visit('/');
  await text('Start').click();
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('gymmy'));
    raw.state.active.startedAt = Date.now() - (24 * 60 + 13) * 1000;
    raw.state.active.location = { name: 'Iron Temple', area: 'Downtown', gymId: 'iron-temple' };
    localStorage.setItem('gymmy', JSON.stringify(raw));
  });
  await visit('/workout');
  await page.getByTestId('set-1-done').first().click();
  await page.waitForTimeout(300);
  await text('Skip')
    .click({ timeout: 1500 })
    .catch(() => {});
  await page.getByTestId('set-2-done').first().click();
  await page.waitForTimeout(1200);
  await shot('02-workout');
  console.log(errors.join('\n') || 'ok');
  await browser.close();
})();
