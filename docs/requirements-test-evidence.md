# หลักฐานทดสอบ Requirement — 31 ตุลาคม 2026

Branch `feature/wishlist-reviews-admin-sales`, base `origin/main` = `3b6b6f8` ตรวจจริงใน local workspace ไม่มี production deploy

## Backend

Final PostgreSQL: **15 tests passed, 239 assertions** (1.72s)
Final SQLite in-memory: **15 tests passed, 239 assertions** (0.93s)
Baseline ก่อนแก้: 9 tests / 97 assertions ทั้งสอง database

```sh
# จาก repository root — credentials เหล่านี้เป็น local Docker defaults เท่านั้น
docker compose exec -T -e APP_ENV=testing -e DB_CONNECTION=pgsql -e DB_HOST=db -e DB_DATABASE=panaprisin_ecommerce_test -e DB_USERNAME=dev_user -e DB_PASSWORD=dev_password -e DB_URL= backend php artisan test --no-ansi
docker compose exec -T backend php artisan test --no-ansi
```

TestCase ตรวจ environment/ชื่อฐานก่อนใช้ RefreshDatabase: อนุญาตเฉพาะ SQLite :memory: หรือ PostgreSQL panaprisin_ecommerce_test ห้ามใช้ฐานจริง Tests มีข้อมูล fixture ในฐานทดสอบ แต่ไม่มี mocked API payload/ยอดขายในฟีเจอร์

| ชุด | ครอบคลุม |
|---|---|
| WishlistTest | guest 401, owner isolation, client user_id ไม่มีผล, PUT ซ้ำเป็นแถวเดียว, ลบของตน, archived/missing product |
| ReviewRatingTest | guest/seller/unpurchased deny, rating 0/6/decimal deny, status spoof deny, pending payment deny, completed purchase, duplicate 409, pending ไม่เผยแพร่, average null/4.0/3.0 จริง, rejected/legacy fake ไม่ถูกนับ |
| AdminDashboardTest | guest/buyer/seller ปฏิเสธครบ 14 endpoints, overview/pagination, users CRUD guard, ห้าม self-role/admin escalation, token revoke, preserve commerce history, product archive, payment mismatch/confirmation/reference, order transitions, review approval/rejection, cancel คืน stock ครั้งเดียว |
| SalesReportTest | auth/role, paid/shipped/completed, exclude pending/cancelled/failed/payment mismatch, multi-seller line totals/distinct orders, archived product, ราคาปัจจุบันไม่เปลี่ยนรายได้, วันไทย boundary, from/to/to-only validation, empty report |
| BuyerCommerceTest / SellerProductTest | checkout idempotency/stock/cart/snapshots/profile/authorization เดิม; ปรับ test สถานะให้ยืนยันเงินจริงก่อน shipped |

## Frontend

`npm run lint` และ `npx tsc --noEmit` ผ่านหลังแก้ไข รอบแรก build พบ null product และแก้แล้ว รอบตรวจสุดท้าย Turbopack ใน sandbox ถูกกัน bind port (`Operation not permitted`) จึงรัน build นอก sandbox ด้วยสิทธิ์ที่อนุญาต ผล build รอบสุดท้ายบันทึกด้านล่าง

## Browser — Chromium + API จริง + PostgreSQL

Scripts:
- `frontend/tests/requirements-browser.mjs`: **PASS**
- `frontend/tests/ecommerce-browser.mjs`: **PASS** (regression เดิม)

stdout รอบผ่าน:
```text
PASS: real PostgreSQL Buyer wishlist/review, Admin payment/order/moderation/user/product/report, Seller isolated report, role guards, mobile layouts; no page errors.
PASS: real API checkout, DB totals/stock/cart, pending payment, refresh, profile, empty/error/unauthorized, ownership, 390px overflow, seller edit, historical snapshot, lost response + refresh replay without duplicate
```

Flow ใหม่: Buyer บันทึก/refresh/ลบ wishlist, สินค้าไม่มีรีวิวแสดงไม่มีรีวิว, ผู้ยังไม่ซื้อส่งรีวิวไม่ได้; checkout สร้าง pending payment จริง; seller report=0 ก่อนจ่าย; Admin ผ่าน UI ยืนยันเงินพร้อม reference → shipped → completed; Buyer ส่ง 4 ดาว pending; Admin อนุมัติผ่าน UI; หน้าสินค้าแสดง 4.0/5 กับ comment จริง; Admin แก้ชื่อ user และราคาสินค้า; seller ยังคงเห็นรายได้ snapshot ฿251.00 แม้ราคาสินค้าเปลี่ยน; Buyer/Seller ถูกกัน Admin page; เก็บ screenshot และตรวจ mobile 390×844 ไม่ล้นจอ; ไม่มี pageerror

Browser regression เดิม: checkout/profile/order ownership/lost-response retry/stock/cart และ Seller edit ผ่านหลังแก้ AbortController ที่ฟอร์มสินค้า

ข้อผิดพลาดที่พบจริงแล้วแก้:
1. TypeScript null product ใน loading/not-found branch
2. label คะแนนรวม option text ทำให้ exact accessible label ไม่ตรง เพิ่ม aria-label
3. Admin category defaultValue ก่อนโหลด options ทำให้ค่าหาย เปลี่ยนเป็น controlled select
4. Seller editor มี late response เขียนทับค่าที่พิมพ์ เพิ่ม cancellation; เก็บ [ภาพ fail จริง](evidence/browser-failure.png) แล้ว rerun ผ่าน

ภาพที่ตรวจด้วยสายตาแล้ว:
- [Wishlist mobile](evidence/requirements-wishlist-mobile.png)
- [Approved review](evidence/requirements-approved-review.png)
- [Admin dashboard](evidence/requirements-admin-dashboard.png)
- [Admin report](evidence/requirements-admin-report.png)
- [Seller report mobile](evidence/requirements-seller-report-mobile.png)

ภาพ regression รอบนี้แยกจากหลักฐานวันที่ 18 ต.ค.:
- [Checkout](evidence/requirements-regression-buyer-confirmation-desktop.png)
- [Account mobile](evidence/requirements-regression-buyer-account-mobile.png)

ยอด Admin ในภาพ ฿502 มาจากสองออเดอร์ที่ทดสอบจริงสะสมจากการ rerun; seller ใหม่เห็นเพียง ฿251 ของตน ภาพไม่ได้ใช้ค่าจำลอง hardcode

## Reproduce browser

เตรียมฐาน local `panaprisin_ecommerce_test` ให้มีอยู่ก่อน จากนั้น migrate additive และ seed เฉพาะ admin/category fixture (script มี guard):

```sh
docker compose exec -T -e APP_ENV=testing -e DB_CONNECTION=pgsql -e DB_HOST=db -e DB_DATABASE=panaprisin_ecommerce_test -e DB_USERNAME=dev_user -e DB_PASSWORD=dev_password -e DB_URL= backend php artisan migrate --force
docker compose exec -T -e APP_ENV=testing -e DB_CONNECTION=pgsql -e DB_HOST=db -e DB_DATABASE=panaprisin_ecommerce_test -e DB_USERNAME=dev_user -e DB_PASSWORD=dev_password -e DB_URL= backend php tests/browser-fixtures.php
```

เริ่ม API จาก backend ด้วย APP_ENV=testing, APP_DEBUG=false, DB_CONNECTION=pgsql, DB_HOST=127.0.0.1, DB_PORT=5432, DB_DATABASE=panaprisin_ecommerce_test, local Docker credentials, DB_URL ว่าง, CACHE_STORE=array, SESSION_DRIVER=array, CORS_ALLOWED_ORIGINS=http://127.0.0.1:3100 แล้ว `php artisan serve --host=127.0.0.1 --port=8091`

เริ่ม frontend ด้วย NEXT_PUBLIC_API_URL และ INTERNAL_API_URL = http://127.0.0.1:8091/api แล้ว `npm run dev -- --hostname 127.0.0.1 --port 3100`

จาก frontend:
```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/requirements-browser.mjs
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/ecommerce-browser.mjs
```

ใช้ Playwright ที่มีอยู่ใน npm cache ไม่เพิ่ม dependency repository; scripts สมัคร buyer/seller และซื้อ/รีวิวผ่าน API จริง; admin/category เป็น isolated fixture เท่านั้น การรัน backend tests ซ้ำจะ rebuild ฐานทดสอบ จึง seed fixtures ใหม่ก่อน browser ทุกครั้งที่ทำ suite ใหม่

## ข้อจำกัด

ยังไม่ได้ตรวจ Safari/Firefox, multi-worker concurrency/load, payment gateway/refund, OAuth regression หรือ full accessibility audit; browser tests ใช้ Next dev server ส่วน production build ตรวจแยก ไม่มีการอ้างว่า browser ทดสอบบน production server; ยืนยันเงินจริงใน production ต้องให้ Admin ตรวจธนาคารก่อนเสมอ หลักฐานนี้ใช้ test reference และทดสอบ workflow ไม่ใช่การโอนเงินจริง

## Final checks

- `npm run build` นอก sandbox: **PASS**, Next.js 15.5.26, generate 26/26 pages รวม /wishlist, /admin/* และ /seller/reports; lint/type validation ใน build ผ่าน
- `npm run lint`: **PASS**
- `npx tsc --noEmit`: **PASS**
- `git diff --check`: **PASS**
- ตรวจภาพทั้ง 5 ภาพของ flow ใหม่ด้วยสายตาแล้ว
- หยุด temporary API/Next test servers หลังทดสอบแล้ว; Docker services เดิมไม่ถูกหยุด
- ไม่มี commit/push/PR/merge/deploy ในงานนี้; การเปลี่ยนแปลงอยู่ใน working tree ของ feature branch พร้อมให้ review
