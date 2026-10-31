# รายงานพัฒนาฟีเจอร์ตาม Requirement — 31 ตุลาคม 2026

ฐานงาน: `origin/main` commit `3b6b6f8` (fetch แล้ว), branch `feature/wishlist-reviews-admin-sales` เท่านั้น ไม่มี push, merge หรือ deploy และไม่แก้ production secrets/database

## Phase 0 — Audit

ตรวจ routes, controllers, models, migrations, frontend และ tests แล้ว: main มี Buyer checkout/account และ Seller product management; มี ReviewController และ ReportController อยู่ จึงขยายของเดิม ไม่สร้างระบบซ้ำ

ช่องว่าง: ไม่มี wishlist; review ไม่ตรวจซื้อจริง; หน้า product fallback 5.0; admin routes กระจัดกระจาย ไม่มี UI และลบ user แบบ cascade; order status ข้ามขั้นได้; report นับ paid/completed โดยไม่ตรวจ payment และตกหล่น shipped; Seller dashboard นับยอด pending จากเพียงหน้าแรก

Baseline ทั้ง SQLite และ PostgreSQL: 9 tests / 97 assertions ผ่าน ก่อนแก้ฟีเจอร์ ใช้ Composer/PHP/Boost ที่ติดตั้งอยู่ใน Docker; `boost:install --guidelines --no-interaction` ระบุไม่มี agent ที่เลือกและไม่ได้แก้ guidelines

## Phase 1 — Wishlist

ไฟล์: `WishlistController.php`, `WishlistItem.php`, migration `2026_10_31_000001_create_wishlist_items_table.php`, `routes/api.php`, `WishlistTest.php`, frontend `app/wishlist/page.tsx`, `WishlistButton.tsx`, `Navbar.tsx`, product page

API ใหม่ (Sanctum): `GET /api/wishlist`, `PUT /api/wishlist/{productId}`, `DELETE /api/wishlist/{productId}` อ่าน/ลบเฉพาะเจ้าของตาม token; PUT idempotent และ DB unique(user_id,product_id) รองรับ duplicate insert; product ปิดขายบันทึกใหม่ไม่ได้ แต่ของที่เคยบันทึกยังเห็นสถานะและลบได้

Migration เป็น additive สร้างตารางใหม่ ไม่แก้ migration เดิม Tests เฉพาะ phase: 1 test / 16 assertions ผ่าน PostgreSQL ข้อจำกัด: wishlist ยังไม่มี pagination

## Phase 2 — Reviews / Rating

ไฟล์: `ReviewController.php`, models `Review.php`, `Product.php`, `ProductController.php`, `ReviewRatingTest.php`, `ProductReviews.tsx`, product page และ `types/api.ts`

ใช้ GET/POST `/api/products/{productId}/reviews` เดิม; เพิ่ม response `average_rating` (null เมื่อไม่มี) และ `reviews_count` ใน products list/detail ไม่มี migration เพิ่ม

เฉพาะ buyer ที่ซื้อสินค้านั้น ออเดอร์ completed และ payment completed/paid_at/ยอดตรงจึงส่งได้ ห้ามรีวิวสินค้าตนเอง; 1–5 integer; จำกัด comment 3000 ตัว; ไม่รับ status/user_id จาก client; lock user และ unique เดิมกันซ้ำ ส่งแล้ว pending เสมอ เผยแพร่และเฉลี่ยเฉพาะ approved ที่มีหลักฐานซื้อจริง รวมถึงกรอง legacy fabricated reviews ออก ไม่ใช้ 5.0 สมมติ

Tests เฉพาะ phase เดิม 1 test / 20 assertions; เพิ่มตรวจเฉลี่ยสองผู้ซื้อ (4+2)/2=3 ใน phase สุดท้าย ข้อจำกัด: ไม่มีแก้ไขรีวิว/แนบรูป/ตอบกลับ; 1 review ต่อ user/product แม้ถูกปฏิเสธ

## Phase 3 — Admin Dashboard

ไฟล์: `AdminController.php`, `OrderController.php`, `Payment.php`, `routes/api.php`, migration `2026_10_31_000002_add_payment_verification_audit.php`, `AdminDashboardTest.php`, ปรับ `BuyerCommerceTest.php`; frontend `app/admin/**`, `components/admin/**`, `RoleGuard.tsx`, `app/seller/layout.tsx`

Admin API ทั้งหมดอยู่หลัง Sanctum + IsAdmin; frontend ตรวจ `/user` จาก server แยก `/admin` และ `/seller` ไม่ใช้ role ใน localStorage เป็น authorization

- GET `/admin/overview`, `/admin/users`, `/admin/products`, `/admin/orders`, `/admin/reviews` (รายการ paginate 20)
- PATCH/DELETE `/admin/users/{id}`: แก้ชื่อ, เปลี่ยน buyer↔seller เฉพาะบัญชีไม่มีประวัติซื้อขาย; ห้ามเปลี่ยน role ตนเอง/บัญชี admin; ไม่สร้าง admin ผ่าน API; revoke tokens เมื่อ role เปลี่ยน; ลบได้เฉพาะบัญชีไม่มีธุรกรรมเพื่อรักษาประวัติ
- POST `/admin/products`, PATCH/DELETE `/admin/products/{id}` ใช้ ProductController เดิมและ archive แทน hard delete
- PATCH `/admin/reviews/{id}` approve/reject พร้อมตรวจหลักฐานซื้อ; PUT `/admin/reviews/{id}/approve` เดิมยังใช้ได้และคืน 404 เมื่อไม่มีรีวิว
- POST `/admin/orders/{id}/confirm-payment`: Admin ยืนยันตรวจยอดเงินจริงพร้อม reference บันทึก `payments.verified_by`, `verification_reference`, `paid_at` และเปลี่ยน pending→paid ใน transaction
- PUT `/admin/orders/{id}/status` และ `/orders/{id}/status` เดิม: paid→shipped→completed; pending→cancelled คืน stock ครั้งเดียวและ payment failed; ห้ามข้ามขั้นและห้ามยกเลิกออเดอร์จ่ายแล้ว

Migration เพิ่ม nullable audit columns และ FK restrictOnDelete; ไม่แก้ข้อมูลเดิม Tests เฉพาะ phase: 3 tests / 82 assertions ผ่าน PostgreSQL

ข้อจำกัด: ยืนยันเงินเป็น manual bank reconciliation ไม่มี gateway/webhook/refund; Admin ต้องตรวจหลักฐานจริงก่อนกดยืนยัน ระบบไม่อ้างว่าตรวจธนาคารอัตโนมัติ UI admin ไม่อัปโหลดรูปสินค้า (Seller editor เดิมทำได้)

## Phase 4 — Sales Report

ไฟล์: `ReportController.php`, `SalesReportTest.php`, `SalesReport.tsx`, `app/admin/reports/page.tsx`, `app/seller/reports/page.tsx`, Seller dashboard

ใช้ GET `/api/reports/sales` เดิม ไม่มี schema/API ซ้ำ; เพิ่ม optional `from`/`to` (YYYY-MM-DD) ตาม paid_at เขต Asia/Bangkok แบบ inclusive day; เงินใช้ subtotal ประวัติรายการซื้อ ไม่ใช้ราคาสินค้าปัจจุบัน; นับ distinct order_id; top 5 เรียง quantity แล้ว product_id; สินค้า archive ยังนับประวัติ

นับเฉพาะ paid/shipped/completed ที่ payment completed, paid_at ไม่ว่าง, amount=order.total_amount; seller จำกัด product.user_id จาก token ไม่เชื่อ query user_id; admin เห็นทุก seller; ไม่มีรายได้แสดง 0 พร้อม empty state

Seller Centre ใช้ API นี้สำหรับยอดรับชำระทั้งหมด แทนการรวม pending จากหน้าแรก พร้อมระบุว่าตัวเลข pending เป็น 20 รายการล่าสุด

Tests รวม ณ จบ phase: PostgreSQL 15 tests / 234 assertions ผ่าน เพิ่มทดสอบ to-only ใน phase สุดท้าย ข้อจำกัด: ยังไม่มี refund/fees/tax/CSV export

## Phase 5 — Tests / Documentation

หลักฐานคำสั่งและภาพ: [requirements-test-evidence.md](requirements-test-evidence.md)
ER/EER ตาม schema: [er-eer.md](er-eer.md)

แก้ปัญหาจากการทดสอบจริง: null product ขณะ loading, label คะแนน, category async ใน Admin editor, request เก่าเขียนทับ Seller editor (เพิ่ม AbortController) เพิ่ม test database guard ใน `tests/TestCase.php` ก่อน RefreshDatabase และ `tests/browser-fixtures.php` จำกัดฐาน `panaprisin_ecommerce_test`/environment testing

ไม่เปลี่ยน production config, ไม่ reset ฐานใช้งาน ไม่เสนอว่า build success เท่ากับ E2E success และยังไม่เปิด Pull Request อัตโนมัติ

ผลสุดท้าย Phase 5: PostgreSQL **15/239**, SQLite **15/239**, lint/typecheck/build **ผ่าน**, browser scripts ใหม่และเดิม **ผ่าน** พร้อมภาพที่ตรวจแล้ว; `git diff --check` ผ่าน ไม่มี migration เดิมถูกแก้ มี additive migrations ใหม่ 2 ไฟล์เท่านั้น รายละเอียดไฟล์/API/migration/tests/ข้อจำกัดแต่ละ phase อยู่ในหัวข้อข้างต้น งานยังไม่ commit/push และไม่มี PR/merge/deploy
