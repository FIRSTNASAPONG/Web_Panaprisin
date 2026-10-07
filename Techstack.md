# Tech Stack — Web Panaprisin

## 1. Frontend Architecture

- **Core Framework:** Next.js 15.x (App Router, React Server Components, Server Actions)
- **UI Library:** React 19.x
- **Language:** TypeScript 5.x
- **Client State Management:** Zustand 5.x (สำหรับจัดการ UI State ฝั่ง Client เช่น ตะกร้าสินค้า หรือ Modal)
- **Data Fetching:** Next.js Native Fetch API (รองรับ Data Caching & Revalidation แบบในตัว)
- **Styling & UI Components:** Tailwind CSS 3.4.x + Shadcn UI
- **Form & Validation:** React Hook Form 7.x + Zod 3.x
- **Runtime (Build):** Node.js 24.14.x (Active LTS)

## 2. Backend Architecture
- **Core Language:** PHP 8.3.x
- **Web Framework:** Laravel 12.x
- **Authentication & Authorization:** Laravel Sanctum 4.x (API Token) + Laravel Gates/Policies (แบ่งสิทธิ์ User/Admin)
- **Queue, Cache & Session:** Laravel Database Driver (จัดการผ่าน PostgreSQL เพื่อลดภาระ Infrastructure)
- **Database ORM:** Eloquent ORM
- **Code Quality:** PHPStan 2.x

## 3. Database, Caching & Search

- **Primary Database:** PostgreSQL 17.x (ทำหน้าที่เป็นทั้ง Database, Session Store, Cache Store และ Queue)
- **Search Engine:** PostgreSQL (ใช้ ILIKE หรือ Full-Text Search พื้นฐาน แทนการแยก Search Engine)
- **Backup Strategy:** pg_dump อัตโนมัติ สำรองไปยัง S3

## 4. Design & Documentation Tools (Deliverables)

- **Database Design (ER/EER/Relational Mapping):** dbdiagram.io
- **Low-fidelity Prototype:** Figma
- **Presentation:** Canva

## 5. Infrastructure, CI/CD & Deployment
- **Containerization:** Docker 27.x + Docker Compose v2 (ลดจำนวน Container ลงเหลือเฉพาะที่จำเป็น)
- **Web Server / Proxy:** Nginx 1.27.x
- **Version Control:** Git + GitHub
- **CI/CD Pipeline:** GitHub Actions (Deploy ได้เร็วขึ้นเนื่องจากลด Dependencies)
- **Container Registry:** GitHub Container Registry (GHCR)
- **Hosting / Server:** Cloud VPS

### Docker Base Images (pinned)
- `node:24.14-alpine`
- `php:8.3-fpm-alpine`
- `postgres:17-alpine`
- `nginx:1.27-alpine`

## 6. Third-Party Services & Integration(optional)

- **Payment Gateway:** Omise API (Test Mode สำหรับจำลองการตัดบัตรและส่งงาน)
- **File Storage:** AWS S3 (สำหรับเก็บรูปภาพสินค้าและรูปโปรไฟล์)
- **Security & CDN:** Cloudflare