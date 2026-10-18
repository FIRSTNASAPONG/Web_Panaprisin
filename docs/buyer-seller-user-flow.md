# Buyer / Seller user flow

## Buyer
1. สมัคร / Login เดิม → เลือกสินค้า → Cart API เก็บรายการของบัญชี
2. Checkout ดึงชื่อ/อีเมลจริง → กรอกผู้รับ/โทรศัพท์/ที่อยู่ → เลือกวิธีชำระเงินที่ต้องการ
3. ยืนยัน → POST /checkout พร้อม UUID → transaction ตรวจ stock/คำนวณเงิน/สร้าง order+items+pending payment/ตัด stock/ล้าง DB cart
4. ได้ order_id จริง → ล้าง UI cart → confirmation โหลด /me/orders/{id}; refresh ได้
5. ถ้า network ไม่ชัดเจน เก็บ request ใน sessionStorage และกดตรวจสอบคำขอเดิมหลัง refresh; validation 422 ล้าง key ให้แก้ข้อมูลได้
6. Navbar → บัญชีของฉัน → Overview, Orders pagination, Order Detail, Profile
7. Profile บันทึก → API whitelist → อัปเดต local user และ Navbar event; email อ่านอย่างเดียว
8. Logout เดิม revoke token และล้าง user/cart

## Seller
1. Login Seller → Seller Centre เดิม → สินค้าของร้าน (backend scoped)
2. เพิ่มสินค้าจากฟอร์มเดิม → หมวดหมู่จาก DB → validation + image upload
3. ตารางสินค้า → แก้ไข → ใช้ฟอร์มเดียวกับเพิ่มสินค้า → multipart method override PATCH
4. ลบ → archive is_active=false; ไม่แสดงในร้าน/ไม่รับ checkout แต่ประวัติยังอ่านได้
5. Orders แสดงเฉพาะรายการสินค้าของร้าน; Admin เท่านั้นเห็น action เปลี่ยนสถานะ (พฤติกรรมเดิม)

## กรณีผิดพลาด
401 แสดงให้ Login; 403 ไม่มีสิทธิ์; 404 ไม่พบหรือไม่ใช่เจ้าของ; 422 field/stock validation; network error มี retry; empty list มีลิงก์เลือกสินค้า. Payment pending ไม่แสดงว่าจ่ายแล้ว. ไม่มีเลขพัสดุ, QR, bank account หรือ slip acceptance ตัวอย่าง.

## ข้อจำกัดที่ยังมี
Guest cart ยังไม่ merge เข้า DB; ไม่มี payment verification/merchant onboarding; cancellation ยังไม่คืน stock; admin order status ไม่ผูก payment transition; OAuth security แยกงาน; account email change ต้องมี verification flow ก่อนเพิ่ม.
