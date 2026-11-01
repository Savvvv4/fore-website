import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'http://localhost:3000';
mkdirSync('shots', { recursive: true });
const report = [];

// A 1x1 PNG to satisfy the required photo.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

/** Elements whose text runs onto more than one line, plus horizontal overflow. */
async function audit(page, name) {
  const found = await page.evaluate(() => {
    const sel = [
      'button', '.button', '.cb-label', 'legend', '.cb-checks label', '.cb-types strong', '.cb-types span span',
      '.cb-step-label', '.cb-form h2', '.cf-sticky strong', '.cc-foot', '.cb-share strong', '.cb-done h1',
      '.coach-join-steps strong', '.val-num', '.aud-hero-copy h1', '.cb-photo strong', '.cb-photo small',
      '.cb-field-error', '.cb-consent span', 'nav a', '.cb-link', '.cb-form-lead',
    ].join(',');
    const out = [];
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue;
      const range = document.createRange();
      range.selectNodeContents(el);
      const tops = new Set([...range.getClientRects()].filter((x) => x.width > 1).map((x) => Math.round(x.top)));
      if (tops.size > 1) out.push({ lines: tops.size, w: Math.round(r.width), text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 90), cls: el.className?.toString?.().slice(0, 40) });
    }
    return { wraps: out, overflowX: document.documentElement.scrollWidth - window.innerWidth };
  });
  report.push({ name, ...found });
}

async function shot(page, name, full = true) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `shots/${name}.png`, fullPage: full });
  await audit(page, name);
}

async function fillStep1(page, type) {
  if (type) await page.getByText(type === 'teaching' ? 'Lessons' : 'Squad', { exact: true }).click();
  await page.fill('input[name="given-name"]', 'Arjun');
  await page.fill('input[name="family-name"]', 'Rao');
  await page.fill('input[name="email"]', 'arjun@example.com');
  await page.fill('input[name="tel-national"]', '9876543210');
  await page.fill('input[name="address-level2"]', 'Gurugram');
  await page.getByRole('button', { name: /Continue/ }).click();
  await page.waitForTimeout(400);
}

const browser = await chromium.launch();
for (const [tag, viewport] of [['390', { width: 390, height: 844 }], ['360', { width: 360, height: 780 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
  await ctx.route(/127\.0\.0\.1:9999/, (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const storage = req.url().includes('/storage/');
    return route.fulfill({ status: storage ? 200 : 201, headers: { ...cors, 'content-type': 'application/json' }, body: storage ? '{"Key":"coach-photos/x.jpg","Id":"x"}' : '' });
  });

  for (const path of ['/coaches', '/coaches/teaching', '/coaches/performance']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const n = path.split('/').pop();
    await shot(page, `${tag}-${n}-top`, false);
    await page.mouse.wheel(0, 1400);
    await shot(page, `${tag}-${n}-sticky`, false);
    if (tag === '390') await shot(page, `${tag}-${n}-full`, true);
  }

  // /coaches/join: step 1 empty, step 1 errors, step 2, step 2 errors, confirmation
  await page.goto(BASE + '/coaches/join', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await shot(page, `${tag}-join-step1`);
  await page.getByRole('button', { name: /Continue/ }).click();
  await shot(page, `${tag}-join-step1-errors`);
  await fillStep1(page, 'teaching');
  await shot(page, `${tag}-join-step2`);
  await page.getByText('Other', { exact: true }).click();
  await page.getByRole('button', { name: /Reserve/ }).click();
  await shot(page, `${tag}-join-step2-errors`);
  // Complete step 2 and submit; the fake database above accepts it.
  await page.fill('input[maxlength="2"]', '12');
  await page.fill('input[placeholder="Club, course or range"]', 'DLF Golf & Country Club');
  await page.getByText('Short game', { exact: true }).click();
  await page.getByText('PGA of India', { exact: true }).click();
  await page.getByText('Other', { exact: true }).click();
  await page.fill('textarea', 'I coach juniors and beginners.');
  await page.setInputFiles('input[type=file]', { name: 'me.png', mimeType: 'image/png', buffer: PNG });
  await page.locator('.cb-consent input').check();
  await shot(page, `${tag}-join-step2-filled`);
  await page.getByRole('button', { name: /Reserve/ }).click();
  await page.waitForSelector('.cb-done', { timeout: 10000 }).catch(() => {});
  await shot(page, `${tag}-join-done`);

  // Performance step 2
  await page.goto(BASE + '/coaches/performance/join', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await fillStep1(page, null);
  await shot(page, `${tag}-perf-step2`);

  await page.goto(BASE + '/coaches/directory', { waitUntil: 'networkidle' });
  await shot(page, `${tag}-directory`, false);
  await ctx.close();
}
await browser.close();
writeFileSync('shots/report.json', JSON.stringify(report, null, 2));
for (const r of report) {
  if (!r.wraps) continue;
  console.log(`== ${r.name} overflowX=${r.overflowX}`);
  for (const w of r.wraps) console.log(`   ${w.lines}L w${w.w} [${w.cls}] ${w.text}`);
}
