# Testing, Security และ Deployment

## หลักเกณฑ์ของหลักฐาน

ผลทดสอบต้องแยกระหว่างการอ่าน source, ผลทดสอบเดิม และผลตรวจเว็บครั้งนี้ ภาพที่เปิดหน้า Login จาก URL Admin เป็นหลักฐานการนำทางของผู้เยี่ยมชม ไม่ใช่การทดสอบ Admin ผ่าน

หลักฐานเดิมใน `evidence/` คงไว้ครบ รวมภาพข้อผิดพลาดและ audit-before เพื่อรักษาที่มาของผล ห้ามตีความว่าเป็นหน้าจอ Production ปัจจุบัน หรือใช้จำนวน tests เดิมเป็นผลรันครั้งนี้

## ความปลอดภัยตามซอร์สโค้ด

- Sanctum บังคับ Bearer authentication และตรวจ role/ownership ใน Controller; `/admin/*` ใช้ IsAdmin
- Checkout ใช้ transaction และ row locks พร้อม unique idempotency key ต่อผู้ซื้อ ราคามาจากฐานข้อมูลและเก็บชื่อ/ราคา snapshot
- การแก้โปรไฟล์ใช้ whitelist; ผู้ใช้ไม่สามารถยกระดับ role ผ่าน profile หรือสมัครเป็น Admin
- OAuth ใช้ session-bound state และ verified email ไม่เขียนทับรหัสผ่านหรือ role เดิม Token ส่งใน fragment และ frontend ล้างออก แต่การเก็บ token ฝั่ง Browser ยังต้องควบคุมความเสี่ยง XSS
- ยืนยันเงินเก็บ audit ผู้ตรวจ/เวลา/reference; ไม่ใช่หลักฐานว่าธนาคารยืนยันโดยอัตโนมัติ

## การทดสอบซ้ำในสภาพแวดล้อมแยก

รัน `php artisan test --no-ansi` ใน backend โดยชี้ฐานข้อมูลทดสอบเท่านั้น; ทดสอบทั้ง SQLite และ PostgreSQL ตาม CI. Frontend ใช้ `npm run lint`, `npx tsc --noEmit`, `npm run build`. Browser scripts ใน `frontend/tests/` มีการสร้าง/เปลี่ยนข้อมูล ห้ามชี้ production โดยไม่เตรียมบัญชีและข้อมูลทดสอบที่เหมาะสม

ชุดทดสอบครอบคลุม authorization, checkout, idempotency, transaction integrity, database constraints และ OAuth ตาม [backend/tests](../backend/tests). ครั้งนี้ไม่ได้รันชุด application regression ซ้ำ จึงไม่อ้างว่าชุดนั้นผ่านในรอบเอกสารนี้

## Deployment และการปฏิบัติการ

ก่อนเผยแพร่จริง ผู้ดูแลต้องตรวจ CI ของ SHA ที่ต้องการ, image tag/digest, environment และ secret ผ่านระบบจัดเก็บที่ปลอดภัย สำรองฐานข้อมูลและ volume ภาพ ตรวจ migration รวม legacy cart duplicates และกำหนดขั้นตอน rollback ที่สอดคล้องกับ schema ก่อนเริ่มงาน ตรวจ `/`, `/up`, `/api/products`, `/api/categories` หลังเผยแพร่

[Health helper](../scripts/check-health.sh) ต้องได้ HTTP 200 ตามเกณฑ์ที่กำหนด; HTTP สำเร็จบาง endpoint ไม่ยืนยัน deploy สำเร็จทุกขั้นตอน สคริปต์ deploy จริงของ Azure ไม่ได้อยู่ครบใน repository จึงยังไม่ยืนยัน rollback หรือสถานะ failed-SHA บน VM

ไม่มีการเผยแพร่ credentials, token หรือข้อมูลบัญชีในเอกสารใหม่ และไม่มีการ Commit, Push, Deploy หรือแก้ฐานข้อมูล Production ในงานเอกสารนี้

## ผลตรวจเว็บไซต์จริง 1 พฤศจิกายน 2026

ใช้ Playwright Chromium แบบไม่เข้าสู่ระบบ เปิดหน้าเว็บจริง 22 หน้าและบันทึกภาพ ไม่ได้ submit สมัครสมาชิก สั่งซื้อ ยืนยันเงิน หรือเปลี่ยนข้อมูล ผู้ใช้ไม่ได้ให้บัญชีทดสอบสำหรับแต่ละ role จึงยังไม่ยืนยันธุรกรรมหลังเข้าสู่ระบบ

**พบข้อผิดปกติ:** GET `/api/user` แบบ anonymous ตอบ 500 แทนผล 401 ที่คาดตามการป้องกัน API; ยังไม่ได้ตรวจสาเหตุจาก server log จึงไม่สรุปว่าเป็นข้อผิดพลาดด้านใด

| เส้นทาง | HTTP | หลักฐาน |
|---|---|---|
| `/` | 200 | [ภาพ](assets/screenshots/home.png) |
| `/login` | 200 | [ภาพ](assets/screenshots/login.png) |
| `/signup` | 200 | [ภาพ](assets/screenshots/signup.png) |
| `/cart` | 200 | [ภาพ](assets/screenshots/cart.png) |
| `/wishlist` | 200 | [ภาพ](assets/screenshots/wishlist.png) |
| `/checkout` | 200 | [ภาพ](assets/screenshots/checkout.png) |
| `/checkout/success` | 200 | [ภาพ](assets/screenshots/checkout-success.png) |
| `/account` | 200 | [ภาพ](assets/screenshots/account.png) |
| `/account/orders` | 200 | [ภาพ](assets/screenshots/account-orders.png) |
| `/account/profile` | 200 | [ภาพ](assets/screenshots/account-profile.png) |
| `/seller` | 200 | [ภาพ](assets/screenshots/seller.png) |
| `/seller/products` | 200 | [ภาพ](assets/screenshots/seller-products.png) |
| `/seller/add-product` | 200 | [ภาพ](assets/screenshots/seller-add-product.png) |
| `/seller/orders` | 200 | [ภาพ](assets/screenshots/seller-orders.png) |
| `/seller/reports` | 200 | [ภาพ](assets/screenshots/seller-reports.png) |
| `/admin` | 200 | [ภาพ](assets/screenshots/admin.png) |
| `/admin/users` | 200 | [ภาพ](assets/screenshots/admin-users.png) |
| `/admin/products` | 200 | [ภาพ](assets/screenshots/admin-products.png) |
| `/admin/orders` | 200 | [ภาพ](assets/screenshots/admin-orders.png) |
| `/admin/reviews` | 200 | [ภาพ](assets/screenshots/admin-reviews.png) |
| `/admin/reports` | 200 | [ภาพ](assets/screenshots/admin-reports.png) |
| `/product/3` | 200 | [ภาพ](assets/screenshots/product.png) |
| `/up` | 200 | HTTP probe |
| `/api/products` | 200 | HTTP probe |
| `/api/categories` | 200 | HTTP probe |
| `/api/user` | 500 | HTTP probe |

HTTP 200 ของหน้า protected หมายถึงโหลดหน้าได้เท่านั้น ภาพ Admin แสดงข้อความให้เข้าสู่ระบบ ไม่ใช่ Dashboard ที่มีข้อมูล ดู [ผลดิบที่ไม่มี response body หรือ credentials](assets/screenshots/verification.json)

![สถานะผู้เยี่ยมชมเมื่อเปิด Admin](assets/screenshots/admin.png)

## ตรวจความสมบูรณ์ของเอกสาร

ตรวจลิงก์ภายใน Markdown หลังจัดโครงสร้าง 95 รายการ ไม่พบปลายทางสูญหาย; ตรวจขนาดภาพ PNG ด้วย sips 42 ไฟล์ อ่านได้ทั้งหมด; หลักฐานเดิม 22 ไฟล์มี SHA-256 ตรงต้นฉบับ ไม่ได้ลบหรือแก้ภาพเดิม `git diff --check` ผ่าน ไม่มีการตรวจปลายทาง References ภายนอกทุกลิงก์ และยังไม่ได้ตรวจภาพเก่าทุกภาพด้านข้อมูลส่วนบุคคล จึงไม่นำภาพเก่ามาแทรกในคู่มือนำเสนอ

## ขอบเขตที่ต้องตรวจเพิ่มก่อนรับรอง Production

- ทดสอบด้วยบัญชี Buyer/Seller/Admin และข้อมูลทดสอบที่แยกจากลูกค้าจริง เพื่อยืนยันธุรกรรมหลังเข้าสู่ระบบ
- ตรวจสาเหตุ HTTP 500 ของ anonymous `/api/user` จาก server log และทดสอบการตอบ JSON โดยไม่เปิดเผยข้อมูลภายใน
- ยืนยัน image digest/SHA, migration status และสคริปต์ Deploy จริงบน Azure ด้วยการตรวจแบบอ่านอย่างเดียว
- ตรวจ Browser อื่นและ concurrent checkout แยกจากผล Chromium และ sequential tests เดิม

การอัปโหลดภาพใหม่ยังไม่มีการล้างภาพเก่าใน ProductController จึงต้องวางแผนดูแลพื้นที่จัดเก็บแยกจากการ archive สินค้า ประเด็นเหล่านี้ยังไม่ได้ดำเนินการหรืออ้างว่าผ่านในงานจัดเอกสาร
