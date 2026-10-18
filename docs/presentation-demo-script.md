# Presentation demo script

ใช้ Local/Test DB เท่านั้น; รัน additive migration ก่อนใช้ฟีเจอร์ใหม่ ห้าม migrate:fresh กับข้อมูลเดิม. เตรียมบัญชี Buyer A/B, Seller A/B และสินค้าสต็อกจริงในฐานสำหรับ demo. ข้อมูลใน Browser automated test เป็น fixtures เฉพาะ test DB ไม่ใช่ข้อมูลตัวอย่างที่ฝังใน UI.

| เวลา | Demo | เกณฑ์ประเมิน / หลักฐาน |
|---|---|---|
| 0–1 นาที | อธิบายปัญหาเดิม: จบ checkout แล้วไม่มีประวัติ, confirmation เป็นตัวอย่าง | Design answers problem: post-purchase journey |
| 1–3 นาที | Buyer A login, cart, checkout, pending confirmation, refresh | Core functionality: order ID/ยอด/สินค้า/ที่อยู่จริง; transaction stock/cart |
| 3–4 นาที | Account overview → orders → detail → profile save | UX/UI: brand เดิม, states, navigation, account state update |
| 4–5 นาที | Buyer B เปิด ID ของ A ได้ not-found | Technical design: Sanctum + ownership backend |
| 5–6 นาที | Seller A edit product; Seller B แก้ผ่าน API ได้ 403; archive แล้วยังดูประวัติได้ | Authorization + referential integrity |
| 6–7 นาที | เปิด test evidence และภาพ mobile/desktop | QA: แยกสิ่งที่รันจริงจากสิ่งที่ยังไม่ทดสอบ |
| 7–8 นาที | อธิบาย payment pending, OAuth follow-up, wishlist deferred | ซื่อสัตย์ต่อข้อจำกัด; ไม่จำลอง payment success |

คำตอบเรื่อง duplicate order: backend serializes buyer requests, unique buyer+UUID, transaction, replay same order; frontend disable submit + stable request payload. Browser suite ยังต้องดูรายการ coverage ใน test-evidence ไม่อ้างครอบคลุมทุก browser/device.

คำตอบเรื่อง Design: ใช้ Navbar/Footer/Tailwind/card/สี #1B4D3E เดิม; เพิ่มหน้าบัญชีและลิงก์ให้ journey หลังซื้อครบขึ้น; ไม่มี UI template ใหม่.
