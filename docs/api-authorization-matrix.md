# API authorization matrix

เส้นทางในตารางมี prefix `/api` และแสดงสิทธิ์ที่คาดตามซอร์สโค้ด ไม่ใช่ผลทดสอบ Production ทุก endpoint; การตรวจ anonymous `/api/user` ครั้งล่าสุดพบ HTTP 500 ดู [ผลตรวจจริง](testing-security-deployment.md)

ทุก protected route ใช้ `auth:sanctum`; ตรวจสิทธิ์จริงที่ Controller. UI guard เป็น UX เท่านั้น

| Endpoint | Guest | Buyer | Seller | Admin | Response / protection |
|---|---|---|---|---|---|
| GET /products, /products/{id} | อ่าน | อ่าน | อ่าน | อ่าน | เฉพาะ is_active; array / product |
| GET /user | 401 | ตนเอง | ตนเอง | ตนเอง | User hidden password/google_id |
| PATCH /user | 401 | ตนเอง | ตนเอง | ตนเอง | whitelist first_name,last_name,phone,address; email read-only; role/password/google_id prohibited |
| GET /me | 401 | ตนเอง | 403 | 403 | user,total_orders,pending_payment,shipping_orders,recent_orders |
| GET /me/orders | 401 | ตนเอง | 403 | 403 | paginator: data,current_page,last_page,total; 10/page |
| GET /me/orders/{id} | 401 | เจ้าของ | 403 | 403 | unrelated/missing ID -> 404; items.product + payment; no-store |
| POST /checkout | 401 | ตนเอง | 403 | 403 | shipping_address,payment_method,idempotency_key UUID; 201 new / 200 replay / 409 changed payload / 422 validation |
| GET /orders | 401 | 403 | เฉพาะรายการของร้าน | เฉพาะสินค้าของบัญชีเมื่อใช้ /orders; ทั้งหมดผ่าน /admin/orders | รูปแบบขึ้นกับ route |
| PUT /orders/{id}/status | 401 | 403 | 403 | เปลี่ยนได้ | state machine; paid ผ่าน confirm-payment เท่านั้น |
| GET /me/products | 401 | 403 | สินค้าของร้าน | สินค้าของบัญชีตนเอง | active array |
| POST /products | 401 | 403 | เพิ่มในร้านตน | เพิ่มในร้านตน | description validated; image jpeg/png/webp <=2MB |
| PATCH/PUT /products/{id} | 401 | 403 | เจ้าของเท่านั้น | เจ้าของเท่านั้นบน /products; ทุกร้านผ่าน /admin/products | whitelist fields; multipart POST + _method=PATCH supported |
| DELETE /products/{id} | 401 | 403 | เจ้าของเท่านั้น | เจ้าของเท่านั้นบน /products; ทุกร้านผ่าน /admin/products | is_active=false, no physical deletion |
| POST/PUT/DELETE /cart | 401 | owner | add denied | add denied | quantity/stock validation; legacy GET cart available all logged-in roles |

Checkout computes price from DB; ignores submitted totals/payment status. Locks buyer then cart then products in ID order; unique(user_id,idempotency_key) is final database constraint. Retry with identical key/address/method returns same order even after cart emptied. A key identifies a checkout attempt, not a mutable cart; UI keeps original payload after uncertain failures. New order item product_name preserves purchased names; old null snapshots are filled before product edit.

## API ประกอบ

| API | สิทธิ์ |
|---|---|
| GET /wishlist; PUT/DELETE /wishlist/{productId} | Sanctum ทุก role, ข้อมูลตนเองเท่านั้น |
| GET /products/{id}/reviews | สาธารณะ เฉพาะ approved + verified purchase |
| POST /products/{id}/reviews | Buyer ที่ซื้อ completed และจ่ายครบ; user_id/status จาก client ใช้ไม่ได้ |
| /admin/* | Sanctum + IsAdmin ทุก endpoint; ดูตาราง Admin ด้านล่าง |
| PUT /orders/{id}/status | Admin; state machine; paid ต้องผ่าน confirm-payment |
| GET /reports/sales | Seller/เส้นทางทั่วไปเฉพาะสินค้าตน; Admin ทั้งระบบใช้ /admin/reports/sales; Buyer 403 |

Admin role ไม่สามารถสร้างผ่าน register/update API; user profile ไม่รับ role; Admin เปลี่ยน role ตนเองไม่ได้และเปลี่ยนบัญชี Admin ไม่ได้

## Admin API

ทุกเส้นทางต่อไปนี้ต้องใช้ Sanctum และ IsAdmin ตาม [routes/api.php](../backend/routes/api.php)

| Method และเส้นทาง | การทำงาน |
|---|---|
| GET /admin/overview | ภาพรวมระบบ |
| GET /admin/users | รายการผู้ใช้ |
| PATCH /admin/users/{id} | แก้ชื่อและ role ตามข้อจำกัดประวัติธุรกรรม |
| DELETE /admin/users/{id} | ลบเฉพาะบัญชีที่ผ่านเงื่อนไขรักษาประวัติ |
| GET /admin/products | สินค้าทุกร้าน รวมสินค้าที่ archive |
| POST /admin/products | สร้างสินค้าโดยบัญชี Admin เป็นเจ้าของ |
| PATCH /admin/products/{id} | แก้สินค้าทุกร้าน |
| DELETE /admin/products/{id} | Archive สินค้าทุกร้าน |
| GET /admin/orders | รายการคำสั่งซื้อทั้งหมด |
| POST /admin/orders/{id}/confirm-payment | ยืนยันเงินพร้อม reference และ audit |
| PUT /admin/orders/{id}/status | เปลี่ยนสถานะตาม state machine |
| GET /admin/reviews | รายการรีวิวเพื่อกลั่นกรอง |
| PATCH /admin/reviews/{id} | อนุมัติหรือปฏิเสธรีวิว |
| PUT /admin/reviews/{id}/approve | เส้นทางอนุมัติรีวิวเดิม |
| GET /admin/reports/sales | ยอดขายรวมทุกผู้ขาย |

อ้างอิง [ProductController](../backend/app/Http/Controllers/ProductController.php): เส้นทาง `/me/products` และ `/products/{id}` ยังจำกัดเจ้าของแม้ผู้เรียกเป็น Admin; ต้องใช้เส้นทาง Admin เพื่อจัดการสินค้าข้ามร้าน
