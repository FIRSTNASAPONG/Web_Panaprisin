// Real local API; network failure injection aborts requests, never returns mock data.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const api = 'http://127.0.0.1:8091/api', base = 'http://127.0.0.1:3100';
async function call(path, token, data, method = 'POST') {
  const response = await fetch(api + path, { method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
  assert.ok(response.ok, `${path}: ${response.status}`);
  return response.status === 204 ? null : response.json();
}
const suffix = Date.now();
const password = 'Testing-password-123';
const register = (role, label = role) => call('/register', null, { first_name: 'Reliability', last_name: role, role, email: `${label}-${suffix}@example.test`, password, password_confirmation: password });
const buyer = await register('buyer'), other = await register('buyer', 'other'), seller = await register('seller');
const categories = await call('/categories', null, null, 'GET');
const product = (await call('/products', seller.access_token, { name: `Reliability ${suffix}`, description: 'Test fixture', category_id: categories[0].id, price: 25, stock_quantity: 10 })).product;
await call('/cart', buyer.access_token, { product_id: product.id, quantity: 1 });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => d.accept());
await mkdir('../docs/evidence/quality', { recursive: true });
async function passwordLogin(email, destination) {
  await page.goto(base + '/login');
  await page.evaluate(() => localStorage.clear());
  await page.getByLabel('อีเมล (Email)', { exact: true }).fill(email);
  await page.getByLabel('รหัสผ่าน (Password)', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
  await page.waitForURL(base + destination);
}
try {
  await passwordLogin(buyer.user.email, '/');
  await page.goto(base + '/cart');
  await page.getByText(product.name, { exact: true }).waitFor();
  const item = (await call('/cart', buyer.access_token, null, 'GET')).items[0];
  // Send actual foreign credentials to the real API: failed deletion must stay visible.
  await page.route(`**/api/cart/${item.id}`, async route => {
    if (route.request().method() === 'DELETE') await route.continue({ headers: { ...route.request().headers(), authorization: `Bearer ${other.access_token}` } });
    else await route.continue();
  });
  await page.getByRole('button', { name: 'ลบ', exact: true }).click();
  await page.getByRole('alert').waitFor();
  await page.getByText(product.name, { exact: true }).waitFor();
  assert.equal((await call('/cart', buyer.access_token, null, 'GET')).items.length, 1);
  await page.unroute(`**/api/cart/${item.id}`);
  await page.getByRole('button', { name: 'ลองอีกครั้ง', exact: true }).click();
  await page.getByText(product.name, { exact: true }).waitFor();
  await context.setOffline(true);
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.getByLabel(`จำนวน ${product.name}`).inputValue(), '1');
  await context.setOffline(false);
  await page.getByRole('button', { name: 'ลองอีกครั้ง', exact: true }).click();
  await page.getByText(product.name, { exact: true }).waitFor();
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.waitForFunction(name => document.querySelector(`input[aria-label="จำนวน ${name}"]`)?.value === '2', product.name);
  assert.equal((await call('/cart', buyer.access_token, null, 'GET')).items[0].quantity, 2);
  const order = await call('/checkout', buyer.access_token, { shipping_address: 'Local QA', payment_method: 'bank_transfer', idempotency_key: crypto.randomUUID() });
  await page.goto(base + '/product/not-a-number');
  await page.getByText('ไม่พบข้อมูลสินค้าที่ค้นหา', { exact: true }).waitFor();
  await page.route(`**/api/products/${product.id}`, route => route.abort('failed'), { times: 1 });
  await page.goto(base + `/product/${product.id}`);
  await page.getByRole('alert').filter({ hasText: 'ไม่สามารถเชื่อมต่อ' }).waitFor();
  await page.getByRole('button', { name: 'ลองอีกครั้ง', exact: true }).click();
  await page.getByRole('heading', { name: product.name, exact: true }).waitFor();
  await passwordLogin(seller.user.email, '/seller');
  await page.route('**/api/orders?*', route => route.abort('failed'), { times: 1 });
  await page.goto(base + '/seller/orders');
  await page.getByRole('alert').filter({ hasText: 'โหลดข้อมูลไม่สำเร็จ' }).waitFor();
  await page.getByRole('button', { name: 'ลองอีกครั้ง', exact: true }).click();
  const detail = page.getByRole('button', { name: 'ดูรายละเอียด', exact: true }).first();
  await detail.click();
  const dialog = page.getByRole('dialog', { name: 'รายละเอียดคำสั่งซื้อ' });
  await dialog.waitFor();
  await page.keyboard.press('Tab');
  assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)));
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  assert.ok(await detail.evaluate(el => el === document.activeElement));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('navigation', { name: 'Seller Centre บนมือถือ' }).getByRole('link', { name: 'ยอดขาย', exact: true }).click();
  await page.getByRole('heading', { name: 'รายงานยอดขาย' }).waitFor();
  await page.screenshot({ path: '../docs/evidence/quality/seller-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await passwordLogin('browser-admin@example.test', '/admin');
  await page.getByRole('heading', { name: 'ภาพรวมระบบ' }).waitFor();
  // Exercise callback with a real issued token; this is NOT a real Google consent test.
  const adminToken = await page.evaluate(() => localStorage.getItem('token'));
  await page.goto(base + `/auth/callback#token=${encodeURIComponent(adminToken)}`);
  await page.waitForURL(base + '/admin');
  assert.equal(new URL(page.url()).hash, '');
  await page.goto(base + '/auth/callback?token=invalid&user=%7B%22role%22%3A%22admin%22%7D');
  await page.waitForURL(/\/login/);
  assert.ok(!page.url().includes('token='));
  await page.goto(base + '/admin/orders');
  await page.getByRole('heading', { name: `คำสั่งซื้อ #${order.order_id} — pending` }).waitFor();
  await page.screenshot({ path: '../docs/evidence/quality/admin-orders-desktop.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS: real password login buyer/seller/admin, cart failed-delete ownership and offline rollback, product error retry/invalid ID, seller error retry, modal keyboard, mobile navigation, callback fragment cleanup/query rejection; no pageerror.');
} catch (error) {
  await page.screenshot({ path: '../docs/evidence/quality/reliability-failure.png', fullPage: true });
  console.error('Failure at', page.url(), await page.locator('body').innerText());
  throw error;
} finally { await browser.close(); }
