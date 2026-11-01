# Web_Panaprisin — Final Project Documentation v1.0

เอกสารภาษาไทยสำหรับนำเสนอและประเมินโครงงาน • วันที่ตรวจ 1 พฤศจิกายน 2026 • ฐานซอร์สโค้ด: main

| ลำดับ | เอกสาร | เนื้อหา |
|---|---|---|
| 1 | [ภาพรวมโครงงาน](project-overview.md) | วัตถุประสงค์ ขอบเขต และ Technology Stack |
| 2 | [สถาปัตยกรรมและ Azure](architecture.md) | ระบบ การส่งข้อมูล และ CI/CD |
| 3 | [ฐานข้อมูล ER/EER](er-eer.md) | ตาราง ความสัมพันธ์ และข้อบังคับ |
| 4 | [คู่มือใช้งาน](user-manual.md) | Buyer, Seller และ Admin |
| 5 | [API และสิทธิ์](api-authorization-matrix.md) | Endpoint และการควบคุมการเข้าถึง |
| 6 | [การทดสอบ ความปลอดภัย และ Deployment](testing-security-deployment.md) | หลักฐาน ขอบเขตที่ตรวจ และข้อจำกัด |
| 7 | [คู่มือนำเสนอ](presentation-guide.md) | ลำดับ Demo และบทพูด |
| 8 | [เอกสารอ้างอิงย้อนหลัง](archive/README.md) | ผลทดสอบเดิมและรายละเอียดเหตุการณ์ |

ภาพใหม่อยู่ใน `assets/screenshots/` ส่วน `evidence/` เก็บหลักฐานต้นฉบับเพื่อการตรวจสอบย้อนหลัง ไม่ใช่การรับรองผล Production ปัจจุบัน คู่มืออธิบายพฤติกรรมจากซอร์สโค้ด; ผล Browser ครั้งนี้แสดงแยกในเอกสารการทดสอบ

## โครงสร้างเอกสาร

```text
docs/
├── README.md                         สารบัญหลัก
├── project-overview.md               ภาพรวมและเทคโนโลยี
├── architecture.md                   สถาปัตยกรรมและ CI/CD
├── er-eer.md                         ฐานข้อมูลและ ER Diagram
├── user-manual.md                    คู่มือสามบทบาท
├── api-authorization-matrix.md       API และสิทธิ์
├── testing-security-deployment.md   การทดสอบและปฏิบัติการ
├── presentation-guide.md             บทพูดและ Demo
├── assets/screenshots/               ภาพเว็บไซต์จริงและผลตรวจ
├── evidence/                         หลักฐานทดสอบต้นฉบับ
└── archive/                          เอกสารอ้างอิงย้อนหลัง
```
