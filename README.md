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
เนื่องจากเราไม่ใช้ Node/PHP ในเครื่อง เราจะสั่งให้ Docker โหลดไลบรารีให้แทน:
```bash
# ฝั่ง Frontend (โหลด node_modules)
docker compose run --rm frontend npm install

# ฝั่ง Backend (โหลด vendor)
docker compose run --rm backend composer install
```

**3. ตั้งค่า Environment ฝั่ง Backend**
```bash
# คัดลอกไฟล์ .env
cp backend/.env.example backend/.env

# สร้าง Application Key ของ Laravel
docker compose run --rm backend php artisan key:generate
```

**4. ปลุกระบบทั้งหมดขึ้นมาทำงาน**
```bash
docker compose up -d
```
> รอประมาณ 15-30 วินาที เพื่อให้ Database และ Service ต่างๆ บูตตัวเองจนเสร็จ

---

## ช่องทางการเข้าถึง (Services & Ports)

เมื่อระบบรันสมบูรณ์แล้ว สามารถเข้าถึง Service ต่างๆ ได้ตามนี้:

| Service | URL / Port | หน้าที่ |
| :--- | :--- | :--- |
| **Frontend (Next.js)** | `http://localhost` | หน้าเว็บหลัก (ทีม Frontend ทำงานที่นี่) |
| **Backend API (Laravel)** | `http://localhost/api` | API Endpoint (ทีม Backend ทำงานที่นี่) |
| **PostgreSQL** | `localhost:5432` | ฐานข้อมูลหลัก |
| **Meilisearch** | `localhost:7700` | ระบบ Search Engine |
| **Valkey (Redis)** | `localhost:6379` | Cache & Queue |

> **หมายเหตุสำคัญสำหรับ Frontend:** Nginx ถูกตั้งค่าให้ทำ Reverse Proxy ไว้แล้ว เวลาเรียกใช้ API **ห้าม** ใส่ `http://localhost:8000/api/...` ให้เรียก Path ตรงๆ เป็น `/api/...` ได้เลย เช่น `axios.get('/api/products')` (หมดปัญหา CORS 100%)

---

## คู่มือสำหรับทีม Frontend (Next.js)

โค้ดทั้งหมดของคุณจะอยู่ในโฟลเดอร์ `/frontend` เมื่อคุณแก้ไขโค้ดและกด Save หน้าเว็บเบราว์เซอร์จะรีเฟรชให้เองอัตโนมัติ (Hot Reload)

**คำสั่งที่ใช้บ่อย (รันที่โฟลเดอร์นอกสุด `Web_Panaprisin`):**

*   **ติดตั้ง Package เพิ่มเติม:**
    ```bash
    docker compose run --rm frontend npm install <package-name>
    ```
*   **ดู Log ของ Next.js (เผื่อมี Error):**
    ```bash
    docker compose logs -f frontend
    ```

---

## คู่มือสำหรับทีม Backend (Laravel)

โค้ดทั้งหมดของคุณจะอยู่ในโฟลเดอร์ `/backend`

**ข้อมูลสำหรับต่อ Database (ผ่านโปรแกรมอย่าง DBeaver หรือ TablePlus):**
*   **Host:** `localhost`
*   **Port:** `5432`
*   **Database:** `panaprisin_db`
*   **Username:** `dev_user`
*   **Password:** `dev_password`

**คำสั่งที่ใช้บ่อย (รันที่โฟลเดอร์นอกสุด `Web_Panaprisin`):**
เนื่องจากเราไม่มี PHP ในเครื่อง ทุกครั้งที่จะใช้ `php artisan` หรือ `composer` ให้รันผ่าน `docker compose exec backend ...` เสมอ

*   **รัน Migration และ Seeder:**
    ```bash
    docker compose exec backend php artisan migrate:fresh --seed
    ```
*   **สร้าง Controller / Model:**
    ```bash
    docker compose exec backend php artisan make:model Product -mc
    ```
*   **ลง Composer Package เพิ่ม:**
    ```bash
    docker compose exec backend composer require <package-name>
    ```
*   **ดู Log ของ Laravel:**
    ```bash
    docker compose logs -f backend
    ```

---

## การปิดระบบและการเคลียร์ข้อมูล

*   **ปิดระบบชั่วคราว (แต่ยังเก็บ Database ไว้):**
    ```bash
    docker compose down
    ```
*   **ปิดระบบและ ล้างข้อมูล Database ทิ้งทั้งหมด (ล้าง Volume):**
    ```bash
    docker compose down -v
    ```