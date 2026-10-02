# Web Panaprisin (E-commerce Web Platform)

โปรเจกต์นี้เป็นระบบ E-commerce แบบ Full-Stack ที่พัฒนาด้วย **Next.js** (Frontend) และ **Laravel** (Backend) โดยระบบทั้งหมดทำงานอยู่ภายใต้สภาพแวดล้อม **Docker** (Containerization) พร้อมใช้ **Nginx** เป็น Reverse Proxy เพื่อตัดปัญหาเรื่อง CORS ระหว่างการพัฒนา

---

## สิ่งที่ต้องมีก่อนเริ่มงาน (Prerequisites)
นักพัฒนา **ไม่จำเป็น** ต้องติดตั้ง Node.js, PHP, PostgreSQL หรือ Service ใดๆ ลงในเครื่องตัวเอง สิ่งที่ต้องมีในเครื่องมีเพียงแค่:
1. **Docker Desktop** (ต้องเปิดโปรแกรมทิ้งไว้ขณะทำงาน)
2. **Git**
3. **VS Code**

---

## วิธีการติดตั้งและรันโปรเจกต์ (Quick Start)

เปิด Terminal, ไปที่โฟลเดอร์ที่คุณต้องการเก็บงาน แล้วรันคำสั่งตามลำดับนี้:

**1. Clone โปรเจกต์ลงเครื่อง**
```bash
git clone <repository-url>
cd Web_Panaprisin
```

**2. ติดตั้ง Dependencies ของ Frontend และ Backend**
```bash
# ฝั่ง Frontend (โหลด node_modules)
docker compose run --rm frontend npm install

# ฝั่ง Backend (โหลด vendor)
docker compose run --rm backend composer install
```

**3. ตั้งค่า Environment Variables**
```bash
# ฝั่ง Backend
cp backend/.env.example backend/.env
docker compose run --rm backend php artisan key:generate

# ฝั่ง Frontend
cp frontend/.env.example frontend/.env.local
```

**4. ปลุกระบบทั้งหมดขึ้นมาทำงาน**
```bash
docker compose up -d
```
> Database ถูกตั้งค่า Healthcheck ไว้แล้ว ระบบจะจัดการบูตตามลำดับที่ถูกต้องให้เองโดยอัตโนมัติ

**5. สร้างตารางและข้อมูลจำลองในฐานข้อมูล (รันครั้งแรกครั้งเดียว)**
```bash
docker compose exec backend php artisan migrate --seed
```

---

## ช่องทางการเข้าถึง (Services & Ports)

| Service | URL / Port | หน้าที่ |
| :--- | :--- | :--- |
| **Frontend (Next.js)** | `http://localhost:8080` | หน้าเว็บหลัก (ทีม Frontend ทำงานที่นี่) |
| **Backend API (Laravel)** | `http://localhost:8080/api` | API Endpoint (ทีม Backend ทำงานที่นี่) |
| **PostgreSQL** | `localhost:5432` | ฐานข้อมูลหลัก |
| **Meilisearch** | `localhost:7700` | ระบบ Search Engine |
| **Valkey (Redis)** | `localhost:6379` | Cache & Queue |

---

## คู่มือสำหรับทีม Frontend (Next.js)

*   เมื่อต้องการ Fetch ข้อมูล **ฝั่ง Client (เช่นใน `useEffect`)** ให้ใช้ตัวแปร `process.env.NEXT_PUBLIC_API_URL`
*   เมื่อต้องการ Fetch ข้อมูล **ฝั่ง Server (Server Components)** ให้ใช้ตัวแปร `process.env.INTERNAL_API_URL`
*   **ติดตั้ง Package เพิ่มเติม:** `docker compose run --rm frontend npm install <package-name>`
*   **ดู Log ของ Next.js:** `docker compose logs -f frontend`

---

## คู่มือสำหรับทีม Backend (Laravel)

**ข้อมูลสำหรับต่อ Database (ผ่าน DBeaver):**
*   **Host:** `localhost` (Port: `5432`)
*   **Database:** `panaprisin_db`
*   **Username:** `dev_user` | **Password:** `dev_password`

**คำสั่งที่ใช้บ่อย (รันที่โฟลเดอร์หน้าสุด):**
*   **รัน Migration:** `docker compose exec backend php artisan migrate`
*   **สร้าง Controller:** `docker compose exec backend php artisan make:controller ProductController`
*   **ลง Package เพิ่ม:** `docker compose exec backend composer require <package-name>`

---

## หมวดแก้ปัญหาเบื้องต้น (Troubleshooting)

**ปัญหา: VS Code แจ้งว่าเซฟไฟล์ไม่ได้ (Permission Denied) หรือลบไฟล์ไม่ได้**
*   **สาเหตุ:** เนื่องจาก Docker เป็นผู้สร้างไฟล์ `node_modules` หรือ `vendor` สิทธิ์การจัดการไฟล์จึงตกไปอยู่ที่ Root ของระบบ
*   **วิธีแก้ (สำหรับ Mac/Linux):** รันคำสั่งนี้ใน Terminal เพื่อดึงสิทธิ์การแก้ไขไฟล์กลับมาที่ตัวคุณ
    ```bash
    sudo chown -R $USER:$USER .
    ```

**ปัญหา: กดรัน `docker compose up -d` แล้ว Database หรือ Backend พัง**
*   **วิธีล้างไพ่เริ่มต้นใหม่แบบสะอาด 100%:**
    ```bash
    docker compose down -v
    docker compose up -d
    ```