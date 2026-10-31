# Demo สำหรับประเมิน — ใช้ฐานข้อมูลทดสอบเท่านั้น

ใช้ local PostgreSQL `panaprisin_ecommerce_test`, `APP_ENV=testing`, backend :8091 และ frontend :3100 โดยตั้ง NEXT_PUBLIC_API_URL/INTERNAL_API_URL ไป backend ทดสอบ ห้ามใช้ production URL หรือ credentials. `backend/tests/browser-fixtures.php` ตรวจ environment และชื่อฐานข้อมูลก่อนสร้าง category/admin ทดสอบ รันหลัง migrations และก่อน browser tests; ไม่ reset ฐานข้อมูล production

## ขั้นตอนสาธิต (ประมาณ 10–15 นาที)

1. Seller สมัคร/เข้าสู่ระบบ สร้างสินค้าใน category จาก DB พร้อมราคา/stock; เปิดบนมือถือแสดงเมนู Seller Centre และ error/retry หากตัดเครือข่าย
2. Buyer สมัครบัญชีใหม่ เปิดสินค้าที่ยังไม่มี review: ไม่มีคะแนน 5.0 สมมติ บันทึก Wishlist ซ้ำและ refresh ยืนยันเหลือรายการเดียว
3. เพิ่มสินค้าใน cart ปรับจำนวน checkout ด้วย bank transfer: ยอดรวมจาก backend, order pending, stock ลดและ cart ว่าง Refresh confirmation แล้วไม่สร้าง order ใหม่
4. Buyer อีกบัญชีลองเปิด order ของคนแรก ต้องถูกปฏิเสธ; buyer/seller เปิด admin API ต้องถูกปฏิเสธ; profile update ไม่สามารถยกระดับ role
5. Admin เปิด dashboard/users/products/orders เห็น payment audit ยืนยันชำระเงินด้วย reference ทดสอบที่ระบุชัดว่าไม่ใช่เงินจริง ต้องใช้หลักฐานธนาคารจริงเมื่อดำเนินงานจริง จากนั้น Seller เปลี่ยน paid → shipped → completed ตามระบบ
6. Buyer ที่ซื้อจริงเขียน review/rating 1–5; rating ที่ไม่มีสิทธิ์/ซ้ำ/นอกช่วงถูกปฏิเสธ Admin moderation แล้วหน้า product คำนวณค่าเฉลี่ยจาก review ที่อนุมัติจริง
7. Admin/Seller เปิด Sales Report ช่วงวันที่เดียวกัน เปรียบเทียบยอด order ที่ชำระจริง โดย seller เห็นเฉพาะ line items ของตน pending/cancelled ไม่เป็นยอดขาย
8. สร้าง pending order อีกอันแล้วยกเลิก ยืนยัน stock คืนครั้งเดียว กดซ้ำ/ใช้ idempotency key เดิมไม่ตัด stock หรือคืนซ้ำ
9. แสดง automated evidence ใน validation.md และ audit.json; แยกอธิบายว่า OAuth consent จริงและ Azure health patch ยังรอ staging/operator verification

## รันทดสอบซ้ำ

จาก repo root ตรวจ Compose ก่อน แล้วใช้ environment ระบุ test DB ทุกครั้ง:

```sh
docker compose config --quiet
docker compose exec -T -e APP_ENV=testing -e DB_CONNECTION=pgsql -e DB_HOST=db -e DB_DATABASE=panaprisin_ecommerce_test -e DB_USERNAME=dev_user -e DB_PASSWORD=dev_password -e DB_URL= backend php artisan test --no-ansi
docker compose exec -T -e APP_ENV=testing -e DB_CONNECTION=pgsql -e DB_HOST=db -e DB_DATABASE=panaprisin_ecommerce_test -e DB_USERNAME=dev_user -e DB_PASSWORD=dev_password -e DB_URL= backend php tests/browser-fixtures.php
python3 tests/health-check-test.py
```

เปิด API/Next เฉพาะ loopback ด้วย test environment ข้างต้น จาก frontend รัน `npm run lint`, `npx tsc --noEmit`, `npm run build` โดยหยุด Next dev ก่อน build จากนั้นเปิด dev เพื่อรัน browser suites:

```sh
node tests/quality-audit.mjs
node tests/reliability-browser.mjs
EVIDENCE_DIR=../docs/evidence/quality/requirements node tests/requirements-browser.mjs
EVIDENCE_DIR=../docs/evidence/quality/regression node tests/ecommerce-browser.mjs
```

ต้องมี Playwright/Chromium ในเครื่อง; ถ้าไม่ได้ติดตั้งเป็น dependency ใน frontend ให้กำหนด PLAYWRIGHT_MODULE เป็น absolute path ของ Playwright ที่ติดตั้งแล้วตามเครื่องตนเอง ห้ามรัน backend RefreshDatabase tests พร้อม browser suites. Browser tests สร้าง test users/orders จริงและทิ้งไว้ใน test DB; อย่าใช้เป็นข้อมูลยอดขายนำเสนอของ production
