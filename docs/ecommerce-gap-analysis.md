# Ecommerce gap analysis — 18 October 2026

ตรวจ main ที่ working tree สะอาดก่อนสร้าง feature/ecommerce-buyer-checkout; สำรวจ App Router, components/context/types/lib, routes, controllers, models, migrations, middleware และ tests ก่อนแก้ application

| Priority | Existing | Missing / Broken | Recommended solution | Impacted files |
|---|---|---|---|---|
| P0 | Sanctum bearer login, buyer/seller/admin | ไม่มี Buyer dashboard/profile/order detail | เพิ่ม ownership-scoped API และ account routes | routes/api.php, BuyerAccountController, frontend/app/account |
| P0 | checkout transaction, ordered stock locks, decimal arithmetic | ไม่มี replay key; confirmation เป็นตัวอย่าง; แนบสลิปไม่ได้บันทึก | unique buyer/idempotency key, real confirmation; ลบช่องรับเงินตัวอย่าง | OrderController, migration, checkout pages |
| P0 | user phone/address มีแล้ว | ไม่มี profile update | whitelist, prohibit role/password/email change (email read-only), validation | BuyerAccountController |
| P1 | Seller dashboard/add/list/delete มีแล้ว; status action admin-only แล้ว | ไม่มี update; description ไม่ถูกบันทึก; delete cascade ลบ order items | ownership update; archive ด้วย is_active; snapshot ชื่อสินค้าใหม่ | ProductController, seller pages, OrderController |
| P0 separate security PR | Google Socialite stateless | token/user ใน URL; email auto-link; overwrite password; ไม่มี OAuth state | ออกแบบ state + one-time code + verified linking และ regression ก่อน merge | SocialAuthController, auth/callback |
| P0 separate security PR | Sanctum statefulApi + bearer | global CSRF wildcard เดิม, token ใน localStorage | ทบทวน cookie/bearer strategy พร้อม OAuth regression; ไม่ปิด protection เพิ่ม | bootstrap/app.php, lib/axios, login |
| P1 | Cart DB ownership | guest cart ไม่ merge; optimistic remove ไม่ตรวจ HTTP error; quantity update ไม่ตรวจ stock | ระบุข้อจำกัด; checkout ต้องตรวจ stock อีกครั้งเสมอ | CartContext, CartController |
| P1 | reviews approved-only API + unique DB | product UI fallback rating 5.0; ไม่มี purchase restriction | ซ่อนคะแนนที่ไม่มีจริง; P2 review workflow | product page, ReviewController |
| P1 | responsive Tailwind cards/navbar/footer | navbar เสี่ยง overflow จอเล็ก, labels ไม่ผูก input; forgot-password placeholder | ปรับ wrap/focus/labels เฉพาะจุด; ไม่เปลี่ยน branding | Navbar, checkout, login |
| P1 | Example tests เท่านั้น | ไม่มี business-flow coverage; factory ใช้ customer ไม่ตรง enum | Feature tests บน isolated test DB; lint/type/build | tests, UserFactory |
| P2 | ไม่มี wishlist | DB-backed favorites | เลื่อนไปหลัง core เสถียร | future migration/API/account |

## Contracts / relationships
User hasMany orders/products; cart hasMany items; orders hasMany items and hasOne payment. Product deletion currently cascades order_items (history loss). Public products returns array; seller GET /orders returns paginated filtered items with `status`, `price`; admin gets model with `order_status`, `unit_price`. ห้ามเปลี่ยน contract เดิมนี้. Buyer endpoints จะใช้ paginated order model with payment; no user/token/password embedding.

## Validation / risk
Controller inline validation เดิม ไม่มี Form Requests/Policies. New protected endpoints must enforce role and owner at backend. Payment pending is independent of order status; admin order status currently does not reconcile payments. No merchant credentials/payment verification workflow exists; do not claim payment success. User deletion cascade remains a separate history-retention risk. No E2E framework in package.json; browser evidence must be explicitly distinguished from build/API tests. No production config or database changes authorized.
