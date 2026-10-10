# 🛒 Panaprisin E-commerce API (Backend)

นี่คือโปรเจกต์ Backend สำหรับระบบ E-commerce ที่รองรับระบบ Multi-vendor (ผู้ขายหลายคน) พัฒนาด้วย **Laravel 11** ทำงานร่วมกับฐานข้อมูล **PostgreSQL** และจัดการ Environment ด้วย **Docker**

ระบบถูกออกแบบมาให้รองรับผู้ใช้งาน 3 ระดับ (Admin, Seller, Customer) พร้อมฟีเจอร์ครบวงจรตั้งแต่การจัดการสินค้า, ระบบตะกร้า, สั่งซื้อสินค้าพร้อมตัดสต็อก, การรีวิวสินค้า และการออกรายงานยอดขาย

---

## 🛠️ Tech Stack (เทคโนโลยีที่ใช้)
*   **Framework:** Laravel 11
*   **Database:** PostgreSQL
*   **Authentication:** Laravel Sanctum (Token-based)
*   **Infrastructure:** Docker & Docker Compose
*   **CORS:** รองรับการเชื่อมต่อกับ Frontend (เช่น Next.js, React)

---

## ✨ Key Features (ฟีเจอร์เด่น)
1.  **Role-Based Access Control (RBAC):** แบ่งสิทธิ์ชัดเจน Admin (ผู้ดูแล), Seller (ผู้ขาย), Customer (ลูกค้า)
2.  **Multi-vendor System:** ผู้ขายสามารถเพิ่มและจัดการสินค้าของตัวเองได้ โดยระบบจะป้องกันไม่ให้ก้าวก่ายสินค้าของร้านอื่น (IDOR Protection)
3.  **Database-driven Cart:** ระบบตะกร้าสินค้าผูกกับบัญชีผู้ใช้ บันทึกลงฐานข้อมูลเพื่อความต่อเนื่อง
4.  **Secure Checkout & Database Transactions:** ระบบสั่งซื้อสินค้าที่มีการตัดสต็อกอัตโนมัติ พร้อมระบบ `DB::rollBack()` ป้องกันข้อมูลพังหากสต็อกไม่พอหรือเกิดข้อผิดพลาด
5.  **Review System (Pending/Approve):** ลูกค้าสามารถรีวิวได้ แต่ต้องรอให้ Admin อนุมัติก่อนถึงจะแสดงผล
6.  **Dynamic Sales Reports:** รายงานยอดขายที่ปรับตาม Role (Seller เห็นเฉพาะร้านตัวเอง, Admin เห็นภาพรวมทั้งหมด)

---

## 🚀 Installation & Setup (วิธีติดตั้งและรันโปรเจกต์)

### 1. Clone Project และตั้งค่า Environment
```bash
git clone <repository_url>
cd <project_folder>
cp .env.example .env
```
> **Note:** ตรวจสอบไฟล์ `.env` ให้แน่ใจว่าเชื่อมต่อฐานข้อมูลถูกต้อง (`DB_CONNECTION=pgsql`) และตั้งค่า `APP_PORT=8080`

### 2. รัน Docker Container
```bash
docker-compose up -d --build
```

### 3. ติดตั้ง Dependencies และตั้งค่าพื้นฐาน
รันคำสั่งเหล่านี้ผ่าน Terminal ของเครื่อง (เข้าไปทำงานใน Container ของ Backend)
```bash
# ติดตั้งแพ็กเกจ PHP
docker-compose exec backend composer install

# สร้าง App Key
docker-compose exec backend php artisan key:generate

# รัน Migration (สร้างตารางในฐานข้อมูล)
docker-compose exec backend php artisan migrate

# ลิงก์โฟลเดอร์รูปภาพให้สามารถเข้าถึงได้จากภายนอก
docker-compose exec backend php artisan storage:link

# ⚠️ สำคัญมาก! ปลดล็อกสิทธิ์โฟลเดอร์สำหรับ Docker เพื่อป้องกัน Error 500 Permission Denied
docker-compose exec backend chmod -R 777 storage bootstrap/cache
```

---

## 🔑 วิธีสร้าง User และ Token สำหรับทดสอบ

เนื่องจากระบบต้องการ Token ในการเข้าถึง API ส่วนใหญ่ ให้รันคำสั่งด้านล่างเพื่อสร้างบัญชีทดสอบ:

```bash
docker-compose exec backend php artisan tinker
```
เมื่อเข้าสู่ Tinker ให้ก๊อปปี้คำสั่งเหล่านี้ไปวางทีละชุด:

**สร้าง Admin:**
```php
$admin = App\Models\User::create(['first_name' => 'Admin', 'last_name' => 'User', 'email' => 'admin@test.com', 'password' => bcrypt('password123'), 'role' => 'admin']);
$admin->createToken('admin-token')->plainTextToken;
```
**สร้าง Seller:**
```php
$seller = App\Models\User::create(['first_name' => 'Seller', 'last_name' => 'Shop', 'email' => 'seller@test.com', 'password' => bcrypt('password123'), 'role' => 'seller']);
$seller->createToken('seller-token')->plainTextToken;
```
**สร้าง Customer:**
```php
$customer = App\Models\User::create(['first_name' => 'Customer', 'last_name' => 'Somchai', 'email' => 'customer@test.com', 'password' => bcrypt('password123'), 'role' => 'customer']);
$customer->createToken('customer-token')->plainTextToken;
```
> **หมายเหตุ:** ให้ก๊อปปี้ Token ที่ระบบสุ่มขึ้นมา (เช่น `1|abcdefg...`) ไปใส่ในช่อง `Authorization: Bearer <Token>` ของ Postman/Thunder Client

---

## 📡 API Endpoints Documentation

*Base URL:* `http://localhost:8080/api`

### 1. Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/register` | สมัครสมาชิกใหม่ | No |
| POST | `/login` | เข้าสู่ระบบ (รับ Token) | No |
| GET | `/user` | ดูข้อมูลโปรไฟล์ตัวเอง | Yes |

### 2. Products (ระบบสินค้า)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/products` | ดูรายการสินค้าทั้งหมด | No | All |
| POST | `/products` | เพิ่มสินค้าใหม่ (ส่งแบบ FormData) | Yes | Seller |
| DELETE | `/products/{id}` | ลบสินค้า (เฉพาะของตัวเอง) | Yes | Seller, Admin |

### 3. Cart (ตะกร้าสินค้า)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/cart` | ดูข้อมูลตะกร้าของตัวเอง | Yes | Customer |
| POST | `/cart` | เพิ่มสินค้าลงตะกร้า | Yes | Customer |
| PUT | `/cart/{itemId}` | อัปเดตจำนวนสินค้าในตะกร้า | Yes | Customer |
| DELETE | `/cart/{itemId}` | ลบสินค้าออกจากตะกร้า | Yes | Customer |

### 4. Checkout (สั่งซื้อสินค้า)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/checkout` | ยืนยันคำสั่งซื้อ ตัดสต็อก เคลียร์ตะกร้า | Yes | Customer |

### 5. Reviews (รีวิวสินค้า)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/products/{id}/reviews`| ดูรีวิวสินค้า (เฉพาะที่ผ่านการอนุมัติ) | No | All |
| POST | `/products/{id}/reviews`| ส่งรีวิวสินค้า (สถานะเริ่มต้น: Pending) | Yes | Customer |
| PUT | `/admin/reviews/{id}/approve`| อนุมัติรีวิว | Yes | Admin |

### 6. Reports (รายงานยอดขาย)
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/reports/sales` | ดูสรุปยอดขาย | Yes | Seller, Admin |

---

## 🌐 Deployment Notes (สำหรับนำขึ้นเซิร์ฟเวอร์จริง)
หากต้องการนำ Backend ไป Deploy ใช้งานจริง ฝ่าย Backend และ Frontend ต้องตรวจสอบสิ่งเหล่านี้:
1.  **CORS:** แก้ไข `FRONTEND_URL` ในไฟล์ `.env` ของ Backend ให้ตรงกับโดเมนของ Frontend
2.  **App URL:** แก้ไข `APP_URL` เป็นโดเมนของ Backend เพื่อให้ URL ของรูปภาพทำงานได้ถูกต้อง
3.  **Storage Link:** รันคำสั่ง `php artisan storage:link` บนเซิร์ฟเวอร์อีกครั้งเพื่อให้รูปภาพ Public


