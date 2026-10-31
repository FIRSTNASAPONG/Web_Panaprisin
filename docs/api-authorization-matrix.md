# API authorization matrix

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
| GET /orders | 401 | 403 | เฉพาะรายการของร้าน | ทั้งหมด | contract เดิม: seller status/price; admin order_status/unit_price |
| PUT /orders/{id}/status | 401 | 403 | 403 | เปลี่ยนได้ | ไม่เปลี่ยน payment_status; workflow reconciliation ยังเป็นงานต่อ |
| GET /me/products | 401 | 403 | สินค้าของร้าน | สินค้าทั้งหมด | active array |
| POST /products | 401 | 403 | เพิ่มในร้านตน | เพิ่มในร้านตน | description validated; image jpeg/png/webp <=2MB |
| PATCH/PUT /products/{id} | 401 | 403 | เจ้าของเท่านั้น | ทั้งหมด | whitelist fields; multipart POST + _method=PATCH supported |
| DELETE /products/{id} | 401 | 403 | เจ้าของเท่านั้น | ทั้งหมด | is_active=false, no physical deletion |
| POST/PUT/DELETE /cart | 401 | owner | add denied | add denied | quantity/stock validation; legacy GET cart available all logged-in roles |

Checkout computes price from DB; ignores submitted totals/payment status. Locks buyer then cart then products in ID order; unique(user_id,idempotency_key) is final database constraint. Retry with identical key/address/method returns same order even after cart emptied. A key identifies a checkout attempt, not a mutable cart; UI keeps original payload after uncertain failures. New order item product_name preserves purchased names; old null snapshots are filled before product edit.

## เพิ่มเติม 31 ตุลาคม 2026

| API | สิทธิ์ |
|---|---|
| GET /wishlist; PUT/DELETE /wishlist/{productId} | Sanctum ทุก role, ข้อมูลตนเองเท่านั้น |
| GET /products/{id}/reviews | สาธารณะ เฉพาะ approved + verified purchase |
| POST /products/{id}/reviews | Buyer ที่ซื้อ completed และจ่ายครบ; user_id/status จาก client ใช้ไม่ได้ |
| /admin/* | Sanctum + IsAdmin ทุก endpoint; รายละเอียดใน requirements-phase-report.md |
| PUT /orders/{id}/status | Admin; state machine; paid ต้องผ่าน confirm-payment |
| GET /reports/sales | Admin ทั้งระบบ / Seller สินค้าตน; Buyer 403 |

Admin role ไม่สามารถสร้างผ่าน register/update API; user profile ไม่รับ role; Admin เปลี่ยน role ตนเองไม่ได้และเปลี่ยนบัญชี Admin ไม่ได้
