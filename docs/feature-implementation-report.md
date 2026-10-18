# Feature implementation report

Branch: `feature/ecommerce-buyer-checkout` จาก clean main; ไม่ push/merge/deploy. วันที่ 18 October 2026.

## Phase 0 — Audit
สำรวจ routes/controllers/models/migrations/tests และ frontend app/components/context/types/lib. Gap matrix อยู่ใน ecommerce-gap-analysis.md. ติดตั้ง Laravel Boost dev dependency ตาม backend/AGENTS.md ผ่าน Composer ใน Docker (host ไม่มี Composer); installer ไม่มี agent ถูกเลือก จึงไม่เปลี่ยน AGENTS.md. ไม่มี runtime dependency/frontend UI template เพิ่ม.

## Phase 1 — Buyer account
เพิ่ม /account, /account/profile, /account/orders และ /account/orders/[id]. API /me, /me/orders, /me/orders/{id}, PATCH /user ใช้ Sanctum และ ownership. Overview คำนวณจำนวนทั้งหมด/รอจ่าย/จัดส่งจาก DB; orders paginate 10. Profile อีเมลอ่านอย่างเดียว, ชื่อ/นามสกุล/โทร/ที่อยู่แก้ได้; whitelist กัน role escalation และอัปเดต Navbar state. ไม่เพิ่ม fields ใน users.

## Phase 2 — Checkout
ต่อยอด transaction/decimal/stock locks เดิม. เพิ่ม buyer lock, UUID idempotency, request fingerprint และ unique constraint. Frontend เก็บ payload เดิมเมื่อผลไม่แน่นอน; retry หลัง refresh ได้แม้ cart ถูก backend ล้างแล้ว. 422 เปิดให้แก้ข้อมูลใหม่. Confirmation ใช้ order_id จาก API และ ownership detail; pending ไม่แสดง paid. ลบ hardcoded customer/address/amount/order/products/QR/bank account และ unsupported slip upload.

Migration additive: orders.idempotency_key nullable UUID, checkout_fingerprint nullable string, unique(user_id,idempotency_key), order_items.product_name nullable. ทดสอบ SQLite/PostgreSQL แยกก่อนรันเฉพาะ migration นี้บน Docker local ที่ตรวจ environment=local, host=db, database=panaprisin_db แล้ว. ไม่แก้ Production DB/config/secrets.

## Phase 3 — Seller products
เพิ่ม PATCH/PUT /products/{id}, GET /me/products; validation price/description/category/stock/image และ owner/admin. ใช้ฟอร์มเพิ่มสินค้าเดิมใน /seller/products/[id]/edit; multipart POST _method PATCH. ลบใช้ is_active=false; checkout/cart ปฏิเสธสินค้าที่ archive; order history ไม่สูญหาย. เก็บชื่อ ณ เวลาซื้อ และ snapshot legacy null ก่อน rename. Seller Orders เดิมมี admin-only action แล้ว ไม่ขยายสิทธิ์.

## Phase 4 — UX
เพิ่ม account links, breadcrumbs, loading/error/empty states, order/payment badges, retry, profile feedback และ disabled submits. Navbar wrap บน mobile โดยคง brand/search/cart/footer. ใช้ shared AccountContent/BuyerOrderDetail เฉพาะจุด. Seller edit disable fields ระหว่างโหลด เพื่อไม่ให้ข้อมูลเดิมเขียนทับที่ผู้ใช้เพิ่งกรอก.

## Phase 5 — Security / deferred PR
แก้ ownership, profile whitelist, upload validation, pending payment integrity ใน core branch. Google OAuth ต้องเป็น PR แยก: token ใน URL, email linking โดยไม่ตรวจ verified และ updateOrCreate เขียนทับ password; stateless ไม่มี state protection. CSRF wildcard เดิมต้องทบทวนพร้อม cookie/bearer regression. ยังไม่ได้แก้ OAuth/auth infrastructure หรืออ้างว่า regression ผ่าน.

Reviewable proposal สำหรับ Security PR: ใช้ random state single-use bound to initiating browser, แลก one-time code แทน bearer URL, require verified provider email, ห้าม auto-link existing email โดยไม่มี authenticated linking, ไม่เขียน password เมื่อ Google login; tests provider callback invalid state/reused code/email collision/password unchanged และ real provider sandbox regression ก่อน merge. ไม่สร้าง PR บน remote เพราะไม่ได้รับอนุญาต push.

## Phase 6
เลื่อน Wishlist/review purchase gating เพื่อให้ core + security review เสร็จก่อน. Public review API approved-only มีแล้ว; product page rating fallback เดิมยังเป็น issue ใน gap analysis.

## Remaining risks
- Payment collection/verification และ stock release on cancellation ยังไม่มี; order/payment status อาจต่างกันตาม workflow เดิม จึงแสดงแยกเสมอ
- Guest cart ไม่ merge; admin user deletion cascade ยังเสี่ยงทำประวัติหาย
- Upload เก็บไฟล์ใหม่แต่ยังไม่ cleanup orphan/ไฟล์เก่า เป็น storage maintenance follow-up
- SessionStorage retry จำกัดแท็บ/browser ปัจจุบัน; key ใหม่ไม่ใช่ business duplicate detector
- Buyer shipping address เป็น snapshot text เดิม ไม่มี tracking/carrier
- Browser evidence ไม่เท่ากับ cross-browser, full accessibility audit หรือ load/concurrency stress test

## Suggested PR boundaries
1. Audit + local dev tooling (commit แยก)
2. Buyer API/dashboard/profile + checkout integrity + tests
3. Seller product update/archive + tests
4. QA/docs และ checkout/browser follow-up
5. OAuth/CSRF security (แยก branch/PR และ regression ก่อน merge)

ไฟล์สำคัญ: backend BuyerAccountController, OrderController, ProductController, CartController, routes/api.php, Models/Order, additive migration, UserFactory, Feature tests; frontend app/account, checkout pages, seller/add-product/products pages, Navbar, AccountContent, BuyerOrderDetail, lib/account, types/api และ tests/ecommerce-browser.mjs. รายการจริงดู git diff main --stat.
