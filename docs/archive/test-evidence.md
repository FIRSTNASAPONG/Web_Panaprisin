> หลักฐานต้นฉบับย้อนหลัง: ไม่ใช่เอกสารนำเสนอฉบับปัจจุบัน เนื้อหาบางส่วนถูกแทนที่ โปรดใช้ [Final Project Documentation v1.0](../README.md)

# Test evidence — 18 October 2026

## Automated backend
- `docker compose exec -T backend php artisan test`: **9 passed, 97 assertions** (SQLite in-memory).
- PostgreSQL **9 passed, 97 assertions** ด้วย command ด้านล่าง; ฐาน `panaprisin_ecommerce_test` สร้างแยก ไม่ใช่ฐานข้อมูลใช้งานเดิม.

```sh
docker compose exec -T -e APP_ENV=testing -e DB_CONNECTION=pgsql -e DB_HOST=db -e DB_PORT=5432 -e DB_DATABASE=panaprisin_ecommerce_test -e DB_USERNAME=dev_user -e DB_PASSWORD=dev_password -e DB_URL= backend php artisan test
```

ค่า credentials ข้างต้นเป็น local Docker defaults ใน docker-compose.yml ไม่ใช่ production credentials. Tests ใช้ RefreshDatabase เฉพาะฐาน test; ห้ามเปลี่ยน DB_DATABASE เป็นฐานใช้งาน.

Coverage: login valid/invalid, guest guard, buyer own/other orders, pagination/summary, seller/admin existing order contract, profile whitelist/role/password/email rejection, validation, stock insufficient rollback, checkout authoritative price/payment pending, replay same key/same ID, changed payload conflict, cleared cart, product name snapshot, owner/admin update, foreign seller deny, invalid upload rejection + actual PNG upload, archive preserves order items, archived product not purchasable.

## Frontend static / production
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed (Next 15.5.26, includes account routes and seller edit route).
- `git diff --check`: passed.

## Browser (Chromium / Playwright)
Standalone script: `frontend/tests/ecommerce-browser.mjs`. Playwright installed temporarily in npm cache, Chromium downloaded for this test, no package.json dependencies added. Backend localhost:8091 explicitly uses PostgreSQL test DB, frontend localhost:3100 uses that API through temporary process environment. CORS/production/Docker networking files unchanged.

Script creates users through real register API and products/cart/orders through real API. Only category fixture inserted directly into isolated DB. No mocked order/payment responses. On completion it prints PASS; throws on failure.

Covered: guest unauthorized account, empty orders, profile save + DB check, real checkout, accurate total, pending payment, stock decrement, DB cart clearing, confirmation refresh, overview/orders/detail navigation, foreign buyer confirmation denied, real network-offline error, seller edit + original order name preserved, no browser pageerror. เพิ่มกรณี API สร้างออเดอร์จริงแล้วตัด response: reload → retry payload เดิม → ได้ order_id เดิม, จำนวนออเดอร์ยังเท่าเดิมและ stock ไม่ถูกตัดซ้ำ ผ่านแล้ว. 390×844 mobile account has no horizontal overflow; desktop confirmation at 1280×900. Screenshots visually inspected.

Artifacts:
- [Buyer confirmation desktop](../evidence/buyer-confirmation-desktop.png)
- [Buyer account mobile](../evidence/buyer-account-mobile.png)

The browser test initially failed: account hydration overwrote typed checkout phone; seller editor accepted input before async data arrived. Fixed by waiting for account hydration with request cancellation and disabling seller fields during load. Rerun passed. มี [ภาพก่อนแก้ checkout hydration race](../evidence/before-fix-checkout-hydration.png) จาก browser test ที่ fail จริง; ไม่มีภาพ baseline main ก่อนเริ่มงาน จึงไม่อ้างว่าเป็นภาพก่อน upgrade ทั้งระบบ.

Reproduction (temporary installed module path varies):
```sh
# From frontend; first start localhost test servers as described below
PLAYWRIGHT_MODULE=/absolute/path/to/temporary/node_modules/playwright/index.mjs node tests/ecommerce-browser.mjs
```
Start backend from backend directory with APP_ENV=testing, APP_DEBUG=false, DB_CONNECTION=pgsql, DB_HOST=127.0.0.1, DB_PORT=5432, DB_DATABASE=panaprisin_ecommerce_test, local Docker credentials, DB_URL empty, CACHE_STORE=array, SESSION_DRIVER=array, CORS_ALLOWED_ORIGINS=http://127.0.0.1:3100; run `php artisan serve --host=127.0.0.1 --port=8091`. Start frontend with NEXT_PUBLIC_API_URL and INTERNAL_API_URL set to http://127.0.0.1:8091/api; run `npm run dev -- --hostname 127.0.0.1 --port 3100`. Seed a category only in isolated DB. Browser fixture users/products remain in test DB for review; no cleanup touches existing data.

## Limits
No Safari/Firefox, real payment provider, Google OAuth regression, full WCAG audit, mobile seller navigation audit, production deployment or multi-worker concurrency/load test. Sequential idempotency feature tests do not prove all concurrent race scenarios. Existing global CSRF wildcard/OAuth risks remain documented. Build success is not represented as E2E success; browser evidence is separate above.
