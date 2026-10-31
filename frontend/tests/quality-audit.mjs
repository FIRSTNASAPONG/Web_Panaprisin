// Read-only page audit after creating real isolated fixtures via API.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = 'http://127.0.0.1:3100';
const api = 'http://127.0.0.1:8091/api';
async function call(path, token, data, method = 'POST') {
  const r = await fetch(api + path, { method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
  assert.ok(r.ok, `${path}: ${r.status} ${r.ok ? '' : await r.text()}`);
  return r.status === 204 ? null : r.json();
}
const suffix = Date.now();
async function register(role) { return call('/register', null, { first_name: 'QA', last_name: role, email: `qa-${role}-${suffix}@example.test`, password: 'Testing-password-123', password_confirmation: 'Testing-password-123', role }); }
const buyer = await register('buyer');
const seller = await register('seller');
const admin = await call('/login', null, { email: 'browser-admin@example.test', password: 'Testing-password-123' });
const categories = await call('/categories', null, null, 'GET');
const product = (await call('/products', seller.access_token, { name: `QA สินค้าทดสอบ ${suffix}`, description: 'ฐานข้อมูลทดสอบจริง', category_id: categories[0].id, price: 100, stock_quantity: 20 })).product;
await call('/cart', buyer.access_token, { product_id: product.id, quantity: 1 });
const order = await call('/checkout', buyer.access_token, { shipping_address: 'QA test address', payment_method: 'bank_transfer', idempotency_key: crypto.randomUUID() });
await call('/cart', buyer.access_token, { product_id: product.id, quantity: 1 });
await call(`/wishlist/${product.id}`, buyer.access_token, null, 'PUT');
const roles = { buyer, seller, admin };
const routes = {
  buyer: ['/', '/login', '/signup', `/product/${product.id}`, '/cart', '/wishlist', '/account', '/account/profile', '/account/orders', `/account/orders/${order.order_id}`, '/checkout', `/checkout/success?order_id=${order.order_id}`],
  seller: ['/seller', '/seller/products', '/seller/add-product', `/seller/products/${product.id}/edit`, '/seller/orders', '/seller/reports'],
  admin: ['/admin', '/admin/users', '/admin/products', '/admin/orders', '/admin/reviews', '/admin/reports'],
};
const output = '../docs/evidence/quality';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const errors = [];
try {
  for (const [role, paths] of Object.entries(routes)) {
    const context = await browser.newContext();
    await context.addInitScript(account => { localStorage.setItem('token', account.access_token); localStorage.setItem('user', JSON.stringify(account.user)); }, roles[role]);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push({ role, url: page.url(), message: error.message }));
    page.on('dialog', dialog => dialog.accept());
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of paths) {
        const response = await page.goto(origin + path);
        await page.waitForLoadState('networkidle');
        const audit = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          width: document.documentElement.scrollWidth,
          unnamedInputs: [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]),textarea,select')].filter(el => el.checkVisibility() && el.getBoundingClientRect().width && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.labels?.length).map(el => ({ tag: el.tagName, type: el.type, placeholder: el.placeholder || '', name: el.name || '' })),
          unnamedButtons: [...document.querySelectorAll('button')].filter(el => el.checkVisibility() && el.getBoundingClientRect().width && !el.innerText.trim() && !el.getAttribute('aria-label') && !el.getAttribute('title')).length,
        }));
        results.push({ role, path, viewport: width, status: response.status(), ...audit });
        if (audit.overflow) await page.screenshot({ path: `${output}/${role}-${width}-${path.replace(/[^a-z0-9]/gi,'_')}.png`, fullPage: true });
      }
    }
    await context.close();
  }
  const issues = results.filter(r => r.overflow || r.unnamedInputs.length || r.unnamedButtons || r.status >= 400);
  await writeFile(`${output}/audit.json`, JSON.stringify({ results, issues, errors }, null, 2));
  console.log(JSON.stringify({ checked: results.length, issues, errors }, null, 2));
  if (process.env.AUDIT_STRICT === '1') { assert.deepEqual(issues, []); assert.deepEqual(errors, []); }
} finally { await browser.close(); }
