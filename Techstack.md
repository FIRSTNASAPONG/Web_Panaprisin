# Tech Stack — Full-Featured E-commerce Web Platform

## 1. Frontend Architecture

- **Core Framework:** Next.js 15.x (App Router, SSR / ISR mode)
- **UI Library:** React 19.x
- **Language:** TypeScript 5.x
- **API / Server State Management:** TanStack Query (React Query) 5.x
- **Client State Management:** Zustand 5.x
- **Styling & UI Components:** Tailwind CSS 3.4.x + Shadcn UI
- **Form & Validation:** React Hook Form 7.x + Zod 3.x
- **Search Client:** Meilisearch JS SDK
- **Runtime (Build):** Node.js 24.14.x (Active LTS)

## 2. Backend Architecture
- **Core Language:** PHP 8.3.x
- **Web Framework:** Laravel 12.x
- **Authentication & Authorization:** Laravel Sanctum 4.x (API Token) + Laravel Gates/Policies (สำหรับแบ่งสิทธิ์ User ปกติ และ Admin)
- **Queue Management:** Laravel Horizon
- **Database ORM:** Eloquent ORM
- **Code Quality:** PHPStan 2.x

## 3. Database, Caching & Search

- **Primary Database:** PostgreSQL 17.x
- **In-Memory Data Store:** Valkey 8.1.x (ใช้งานร่วมกันทั้ง Cache และ Queue Session)
- **Search Engine:** Meilisearch 1.11.x (ซิงค์ข้อมูลสินค้าด้วย Laravel Scout)
- **Backup Strategy:** pg_dump อัตโนมัติ สำรองไปยัง S3

## 4. Design & Documentation Tools (Deliverables)

- **Database Design (ER/EER/Relational Mapping):** dbdiagram.io
- **Low-fidelity Prototype:** Figma
- **Presentation:** Canva

## 5. Infrastructure, CI/CD & Deployment
- **Containerization:** Docker 27.x + Docker Compose v2
- **Web Server / Proxy:** Nginx 1.27.x
- **Version Control:** Git + GitHub
- **CI/CD Pipeline:** GitHub Actions
- **Container Registry:** GitHub Container Registry (GHCR)
- **Hosting / Server:** Cloud VPS

### Docker Base Images (pinned)
- `node:24.14-alpine`
- `php:8.3-fpm-alpine`
- `postgres:17-alpine`
- `valkey/valkey:8.1-alpine`
- `nginx:1.27-alpine`
- `getmeili/meilisearch:v1.11`

## 6. Third-Party Services & Integration

- **Payment Gateway:** Omise API (ใช้ **Test Mode** สำหรับจำลองการตัดบัตรและส่งงาน)
- **File Storage:** AWS S3 (สำหรับเก็บรูปภาพสินค้าและรูปโปรไฟล์)
- **Security & CDN:** Cloudflare