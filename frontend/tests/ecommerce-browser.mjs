// Run against the isolated local test servers only. No mocked orders or payments.
// PLAYWRIGHT_MODULE must point to a temporary installation's index.mjs.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const api = 'http://127.0.0.1:8091/api';
const base = 'http://127.0.0.1:3100';
const output = process.env.EVIDENCE_DIR || '../docs/evidence';
await mkdir(output, { recursive: true });
async function call(path, token, data, method = 'POST') {
  const res = await fetch(api + path, { method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
  assert.ok(res.ok, `${method} ${path}: ${res.status} ${await (res.ok ? Promise.resolve('') : res.text())}`);
  return res.json();
}
const suffix = Date.now();
const register = role => call('/register', null, { first_name: 'Browser', last_name: role, email: `${role}-${suffix}@example.test`, password: 'Testing-password-123', password_confirmation: 'Testing-password-123', role });
const seller = await register('seller');
const buyer = await register('buyer');
const other = await call('/register', null, { first_name: 'Other', last_name: 'Buyer', email: `other-${suffix}@example.test`, password: 'Testing-password-123', password_confirmation: 'Testing-password-123' });
const categories = await call('/categories', null, null, 'GET');
assert.ok(categories.length, 'Seed a category in the isolated test DB');
const product = (await call('/products', seller.access_token, { name: `Browser antique ${suffix}`, description: 'Real database test fixture', price: '125.50', stock_quantity: 3, category_id: categories[0].id })).product;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on('dialog', dialog => dialog.accept());
const errors = [];
page.on('pageerror', error => errors.push(error.message));
async function login(account) {
  await page.goto(base + '/login');
  await page.evaluate(account => { localStorage.setItem('token', account.access_token); localStorage.setItem('user', JSON.stringify(account.user)); localStorage.removeItem('cart'); }, account);
}
try {
  await page.goto(base + '/account');
  await page.getByRole('alert').filter({ hasText: 'กรุณาเข้าสู่ระบบ' }).waitFor();
  await login(buyer);
  await page.goto(base + '/account/orders');
  await page.getByText('ยังไม่มีคำสั่งซื้อ').waitFor();
  await page.goto(base + '/account/profile');
  await page.getByLabel('ชื่อ', { exact: true }).fill('Updated Browser');
  await page.getByRole('button', { name: 'บันทึกข้อมูล', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'บันทึกข้อมูลสำเร็จ' }).waitFor();
  assert.equal((await call('/user', buyer.access_token, null, 'GET')).first_name, 'Updated Browser');
  await call('/cart', buyer.access_token, { product_id: product.id, quantity: 2 });
  await page.goto(base + '/checkout');
  await page.getByLabel('เบอร์โทรศัพท์', { exact: true }).fill('0812345678');
  await page.getByLabel('ที่อยู่', { exact: true }).fill('123 Test Road');
  await page.getByLabel('ตำบล', { exact: true }).fill('Test Subdistrict');
  await page.getByLabel('อำเภอ', { exact: true }).fill('Test District');
  await page.getByLabel('จังหวัด', { exact: true }).fill('เชียงใหม่');
  await page.getByLabel('รหัสไปรษณีย์', { exact: true }).fill('50000');
  await page.getByRole('checkbox').check();
  await page.locator('button[type="submit"]').last().click();
  await page.waitForURL('**/checkout/success?order_id=*');
  const id = new URL(page.url()).searchParams.get('order_id');
  await page.getByRole('heading', { name: `บันทึกคำสั่งซื้อแล้ว #${id}` }).waitFor();
  await page.getByText('คำสั่งซื้อนี้ยังไม่ยืนยันการชำระเงิน', { exact: false }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: `บันทึกคำสั่งซื้อแล้ว #${id}` }).waitFor();
  await page.screenshot({ path: `${output}/buyer-confirmation-desktop.png`, fullPage: true });
  const order = await call(`/me/orders/${id}`, buyer.access_token, null, 'GET');
  assert.equal(Number(order.total_amount), 251);
  assert.equal(order.payment.payment_status, 'pending');
  assert.equal((await call('/cart', buyer.access_token, null, 'GET')).items.length, 0);
  assert.equal((await call(`/products/${product.id}`, null, null, 'GET')).stock_quantity, 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/account');
  await page.getByRole('heading', { name: 'คำสั่งซื้อล่าสุด' }).waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile overflow');
  await page.screenshot({ path: `${output}/buyer-account-mobile.png`, fullPage: true });
  await page.getByRole('link', { name: 'คำสั่งซื้อของฉัน', exact: true }).click();
  await page.getByRole('link', { name: new RegExp(`คำสั่งซื้อ #${id}`) }).click();
  await page.getByRole('heading', { name: `รายละเอียดคำสั่งซื้อ #${id}` }).waitFor();
  // The backend commits a real order, but the browser loses its response.
  await call('/cart', buyer.access_token, { product_id: product.id, quantity: 1 });
  await page.goto(base + '/checkout');
  for (const [label, value] of [['เบอร์โทรศัพท์', '0812345678'], ['ที่อยู่', '456 Retry Road'], ['ตำบล', 'Subdistrict'], ['อำเภอ', 'District'], ['จังหวัด', 'เชียงใหม่'], ['รหัสไปรษณีย์', '50000']]) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await page.getByRole('checkbox').check();
  let committedId;
  await page.route('**/api/checkout', async route => {
    const response = await route.fetch();
    assert.equal(response.status(), 201);
    committedId = (await response.json()).order_id;
    await route.abort('failed');
  }, { times: 1 });
  await page.locator('button[type="submit"]').last().click();
  await page.getByRole('alert').filter({ hasText: 'ไม่สามารถเชื่อมต่อ' }).waitFor();
  assert.ok(committedId);
  await page.reload();
  await page.getByRole('button', { name: 'ตรวจสอบคำสั่งซื้อเดิม' }).click();
  await page.waitForURL(`**/checkout/success?order_id=${committedId}`);
  await page.getByRole('heading', { name: `บันทึกคำสั่งซื้อแล้ว #${committedId}` }).waitFor();
  assert.equal((await call('/me/orders', buyer.access_token, null, 'GET')).total, 2);
  assert.equal((await call(`/products/${product.id}`, null, null, 'GET')).stock_quantity, 0);
  await login(other);
  await page.goto(base + `/checkout/success?order_id=${id}`);
  await page.getByRole('alert').filter({ hasText: 'ไม่พบคำสั่งซื้อ' }).waitFor();
  // Real network failure; no mocked API payloads.
  await context.setOffline(true);
  await page.getByRole('button', { name: 'ลองอีกครั้ง' }).click();
  await page.getByRole('alert').filter({ hasText: 'ไม่สามารถเชื่อมต่อ' }).waitFor();
  await context.setOffline(false);
  await login(seller);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + `/seller/products/${product.id}/edit`);
  await page.getByRole('heading', { name: 'แก้ไขสินค้า' }).waitFor();
  await page.waitForFunction(name => document.querySelector('input[type="text"]')?.value === name, product.name);
  await page.locator('input[type="text"]').first().fill('Edited browser antique');
  await page.getByRole('button', { name: 'บันทึกและเผยแพร่' }).click();
  await page.waitForURL('**/seller/products');
  await page.getByText('Edited browser antique', { exact: true }).waitFor();
  assert.equal((await call(`/products/${product.id}`, null, null, 'GET')).name, 'Edited browser antique');
  assert.equal((await call(`/me/orders/${id}`, buyer.access_token, null, 'GET')).items[0].product_name, product.name);
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS: real API checkout, DB totals/stock/cart, pending payment, refresh, profile, empty/error/unauthorized, ownership, 390px overflow, seller edit, historical snapshot, lost response + refresh replay without duplicate');
} catch (error) {
  await page.screenshot({ path: `${output}/browser-failure.png`, fullPage: true });
  console.error('Browser failure at', page.url(), await page.locator('main').innerText());
  throw error;
} finally { await browser.close(); }
