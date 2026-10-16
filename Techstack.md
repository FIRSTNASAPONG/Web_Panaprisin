# Tech Stack — Web Panaprisin

เอกสารนี้อธิบาย **เทคโนโลยีที่พบใน Source Code / Deployment จริง** ณ 16 ตุลาคม 2026 โดยแยกสิ่งที่ติดตั้งแล้วออกจากสิ่งที่ยังเป็นแผนพัฒนา ไม่ใช่รายการแพ็กเกจที่ควรติดตั้งทุกตัว

## 1. Frontend

| ส่วน | เทคโนโลยี | สถานะ / หมายเหตุ |
|---|---|---|
| Framework | **Next.js 15.5.26** | App Router, Turbopack (`next build --turbopack`) |
| UI runtime | **React 19.1.0**, React DOM 19.1.0 | ตาม `frontend/package.json` |
| Language | **TypeScript 5.x** | ตาม Dependency Constraint `^5` |
| Styling | **Tailwind CSS 4.x** | ใช้ `@tailwindcss/postcss` 4.x |
| HTTP client | **Axios 1.x** และ Native `fetch` | มีการใช้งานทั้งสองแบบ |
| Icons | **lucide-react** | ตาม Dependencies |
| Client state | **React Context และ `useState`** | เช่น Cart Context; ไม่พบ Zustand ใน Dependencies |
| Runtime / Build Image | **Node.js 24.14 Alpine** | ตาม `frontend/Dockerfile.prod` |
| Code quality | **ESLint 9**, `eslint-config-next` 15.5.26 | GitHub CI รัน Lint, Typecheck, Build |

`frontend/package.json` ปัจจุบัน **ไม่ประกาศ** Zustand, shadcn/ui, React Hook Form หรือ Zod จึงไม่ระบุเป็นเทคโนโลยีที่ใช้งานแล้ว แม้ว่าจะนำมาเพิ่มในอนาคตได้

## 2. Backend

| ส่วน | เทคโนโลยี | สถานะ / หมายเหตุ |
|---|---|---|
| Language | **PHP 8.3** | PHP-FPM Alpine Production Image |
| Framework | **Laravel 13.x** | `laravel/framework: ^13.17` ใน Composer |
| Authentication | **Laravel Sanctum 4.x** | Bearer Personal Access Tokens, `auth:sanctum` |
| Social authentication | **Laravel Socialite 5.x** | Google OAuth; ต้องปรับ Security ก่อนใช้งานจริง |
| ORM | **Eloquent** | Models, Relationships, Migrations, Seeders |
| Database / Queue / Cache / Session | **PostgreSQL-backed Laravel Drivers** | ใช้ Database Drivers ตาม Environment |
| Tests | **PHPUnit 12.x / Laravel Test Runner** | GitHub CI รัน `php artisan test` |
| Code formatting | **Laravel Pint** | มีอยู่ใน `require-dev` |

หมายเหตุ: Source Code มีการใช้ Role Checks/Middleware เช่น `IsAdmin`; **ไม่ควรกล่าวว่ามี Laravel Gates/Policies ครบถ้วน** จนกว่าจะตรวจการ Implement จริง และไม่พบ `phpstan/phpstan` ใน `backend/composer.json` ที่ตรวจ

## 3. Database และ File Storage

- **PostgreSQL 17 Alpine**: ฐานข้อมูลหลัก; ใช้ร่วมกับ Laravel Queue/Session/Cache ตาม Environment
- **Database Migration**: จัดการ Schema ของ Users, Products, Categories, Carts, Orders, Payments และ Reviews
- **CategorySeeder**: เติมข้อมูลหมวดหมู่สินค้า 4 ประเภท ด้วย `firstOrCreate`; ไม่ควรเรียก `DatabaseSeeder` บน Production เพราะมีการสร้าง Demo Admin ผ่าน Factory
- **Product Images**: Laravel public filesystem บน Persistent Docker Volume และ Nginx เสิร์ฟผ่าน `/storage/`
- **Backup**: `pg_dump -Fc` ผ่าน systemd Timer บน Azure VM; เก็บ Local Backup + SHA256 Checksum; **ยังไม่มี Offsite S3 Backup ที่ยืนยันว่าใช้งานจริง**
- **Search**: ใช้ความสามารถของ PostgreSQL เมื่อมีการ Implement Query ค้นหาจริง; ไม่พบการ Deploy Meilisearch ใน Production Compose ที่ตรวจ

## 4. Deployment Infrastructure

| ส่วน | เทคโนโลยี / โครงสร้าง |
|---|---|
| Cloud | **Microsoft Azure Virtual Machine**, Ubuntu 24.04, Linux AMD64 |
| Domain | **panaprisin.me** |
| HTTPS / TLS | **Caddy 2 Alpine** — TLS termination และ HTTPS อัตโนมัติ |
| Reverse Proxy | **Nginx 1.27 Alpine** — Frontend/API Routing, Public Assets |
| Containerization | **Docker Engine + Docker Compose** |
| Frontend image | `ghcr.io/firstnasapong/web-panaprisin-frontend:sha-<commit>` |
| Backend image | `ghcr.io/firstnasapong/web-panaprisin-backend:sha-<commit>` |
| Database image | `postgres:17-alpine` |
| Laravel background jobs | **Queue Worker** แยก Container |
| Storage persistence | Docker Named Volumes สำหรับ PostgreSQL, Images, Public Assets และ Caddy State |
| Backup scheduling | **systemd Timer** บน Azure VM |

Production ใช้ `compose.prod.yml` ซึ่งต่างจาก Development `docker-compose.yml` (Local Development ใช้ Nginx Port 8080 ส่วน Production ใช้ Caddy ที่ Port 80/443)

## 5. GitHub CI/CD (Approval-based Auto-CD)

```text
Developer → Pull Request → GitHub CI
                              ↓
                         Merge to main
                              ↓
                 GitHub Actions builds images
                              ↓
                       GHCR (SHA tags)
                              ↓
                 Publish approved GitHub Release
                              ↓
                  GitHub Actions release trigger
                              ↓
              SSH forced command → Azure VM
                              ↓
        Verify Release/CI/Images → Backup → Deploy
                              ↓
                  Migration + HTTP Health Checks
```

- **CI:** `.github/workflows/ci.yml` — ESLint, TypeScript, Next.js Build, Laravel Tests
- **Image Publishing:** `.github/workflows/publish-images.yml` — Docker Buildx สร้าง Linux/AMD64 Images ตาม Commit SHA และ Push ไป GHCR
- **Release-triggered CD:** `.github/workflows/deploy-production.yml` — `release: published` และ SSH ไป Azure ผ่าน GitHub Secrets
- **VM Deploy Scripts:** `scripts/check-approved-release.sh`, `scripts/auto-deploy.sh`, `scripts/deploy.sh`, `scripts/backup-db.sh` (ยืนยันการใช้งานบน VM; Scripts บางไฟล์อาจยังไม่อยู่ใน GitHub)
- **Operational Controls:** Deploy Lock, Current SHA State, Failed SHA Guard, Backup ก่อน Deploy, Public Health Checks

**ข้อจำกัดปัจจุบัน:** Release Checker ตรวจ Release ล่าสุดที่เข้าเงื่อนไข ไม่ได้ผูก Event SHA แบบแข็งแรงทุกกรณี; ยังไม่มี Automatic Rollback ที่รับประกันการกู้ Schema/Data หลัง Migration; ควรควบคุมสิทธิ์ Git Tag/Release และ Secrets เพิ่มเติมก่อนรับลูกค้าจริง

## 6. Security และ Configuration

- **Local:** `APP_ENV=local`, `APP_DEBUG=true`, `APP_URL` ใช้ Local Origin
- **Production:** `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://panaprisin.me`, `SESSION_SECURE_COOKIE=true`
- **OAuth Variables:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (ค่าแยกตาม Environment)
- **Frontend/API Variables:** `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `CORS_ALLOWED_ORIGINS`
- **Secrets:** `APP_KEY`, `DB_PASSWORD`, Google OAuth Secret, GitHub SSH Private Key — ห้าม Commit/แสดงในเอกสาร และต้อง Rotate เมื่อถูกเปิดเผย
- **Known gaps:** Google OAuth Token ผ่าน Query String, การทดสอบ CSRF/Trusted Proxy, Client Token ใน localStorage, การแสดง Payment QR และ Checkout Success แบบตัวอย่าง

## 7. Design Tools / Planned Integrations

- **Design/Documentation:** Figma, dbdiagram.io, Canva — เครื่องมือสนับสนุนการออกแบบ/รายงาน ไม่ใช่ Production Runtime
- **Possible future integrations:** Payment Gateway (เช่น Omise Test Mode), Object Storage (เช่น AWS S3), CDN/Edge Security (เช่น Cloudflare), Advanced Search

รายการ Planned เหล่านี้ **ยังไม่ควรอ้างว่าทำงานอยู่บน Production** หากไม่ได้ติดตั้งและทดสอบแล้ว

## 8. หลักการอัปเดตเวอร์ชัน

ให้ตรวจ `frontend/package-lock.json`, `backend/composer.lock`, Dockerfiles และ CI ก่อนเปลี่ยนเวอร์ชัน การระบุเลขเวอร์ชันในเอกสารไม่ใช่การอัปเกรด Dependencies จริง แนะนำให้อัปเดตเป็น Pull Request แยก พร้อม Tests และ Release Approval แทนการอัปเกรด Major Versions พร้อมกัน
