# Web Panaprisin — E-commerce Web Platform

เว็บไซต์ E-commerce สำหรับซื้อขายของเก่าและของสะสม พัฒนาด้วย **Next.js 15**, **React 19**, **TypeScript**, **Laravel 13** และ **PostgreSQL 17** ใช้ Docker Compose สำหรับการพัฒนาและ Deploy บน Azure VM ผ่าน GitHub Actions และ GitHub Container Registry (GHCR)

- เว็บไซต์สาธิต: https://panaprisin.me
- Source code: https://github.com/FIRSTNASAPONG/Web_Panaprisin
- รายละเอียดเทคโนโลยี: [Techstack.md](./Techstack.md)

> **สถานะ:** CI, Image Publishing, HTTPS และ Release-triggered Deployment ถูกติดตั้งและใช้งานแล้ว แต่ฟังก์ชันบางส่วน (โดยเฉพาะ Payment, Google OAuth, Checkout Success และการจัดการสิทธิ์) ยังต้องตรวจสอบก่อนใช้กับลูกค้าจริง หน้า Checkout Success ปัจจุบันยังมีข้อมูลตัวอย่าง ห้ามใช้เป็นหลักฐานการรับชำระเงิน

## Architecture โดยย่อ

```text
Browser
  └── HTTPS (panaprisin.me)
       └── Caddy (TLS termination)
            └── Nginx (reverse proxy / static files)
                 ├── Next.js frontend (port 3000, internal)
                 └── Laravel PHP-FPM backend (port 9000, internal)
                      └── PostgreSQL 17
```

Production ใช้ `compose.prod.yml` และไฟล์ตั้งค่า `deploy/local/backend.env` **บน Azure VM เท่านั้น** (ไม่ Commit ลง Git) มี Docker volumes สำหรับฐานข้อมูล รูปภาพ และ Public Assets รวมถึง Container สำหรับ Laravel Queue Worker

## Prerequisites สำหรับ Local Development

- Docker Desktop + Docker Compose
- Git
- Editor เช่น VS Code
- Port `8080`, `3000` และ `5432` ต้องไม่ชนกับโปรแกรมอื่น (ตาม `docker-compose.yml`)

ไม่จำเป็นต้องติดตั้ง PHP หรือ PostgreSQL บน Host หากใช้ขั้นตอนผ่าน Docker ทั้งหมด สำหรับการตรวจด้วย CLI บน Mac โดยตรงให้ใช้ Node.js 24 เพื่อให้ใกล้เคียง CI/Docker Build

## Quick Start — Local Development

รันคำสั่งจากโฟลเดอร์หลักของ Repository (`Web_Panaprisin`) เว้นแต่ระบุไว้ต่างหาก

### 1. Clone Repository

```bash
git clone https://github.com/FIRSTNASAPONG/Web_Panaprisin.git
cd Web_Panaprisin
```

### 2. ตั้งค่า Environment ก่อนเริ่มบริการ

```bash
cp backend/.env.example backend/.env
```

ตรวจและแก้ `backend/.env` ให้ตรงกับ Local Docker เช่น `DB_HOST=db`, `DB_DATABASE=panaprisin_db`, `DB_USERNAME=dev_user`, `DB_PASSWORD=dev_password` และ `APP_URL=http://localhost:8080` (URL ที่ผู้ใช้เรียกผ่าน Nginx สำหรับ Local)

ถ้าใน Repository มี `frontend/.env.example` ให้คัดลอกเป็น `.env.local` หรือสร้าง `frontend/.env.local` ด้วยค่าที่ใช้เรียก API จาก Browser:

```dotenv
NEXT_PUBLIC_API_URL=/api
```

> `NEXT_PUBLIC_*` เป็นค่าที่ถูกนำไปใช้ใน Browser; **ห้ามใส่ Secret** ลงในตัวแปรดังกล่าว และไม่ต้องใส่ URL เต็มหาก Browser เรียกผ่าน Nginx ที่ Origin เดียวกัน

สำหรับ Google OAuth ใน Local (เฉพาะผู้ที่ตั้งค่า Google Cloud OAuth Client แล้ว):

```dotenv
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
SANCTUM_STATEFUL_DOMAINS=localhost:8080,localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

ตั้ง `GOOGLE_REDIRECT_URI` ให้ตรงกับ Authorized Redirect URI ใน Google Cloud Console; การใช้ `localhost:3000` เป็น `FRONTEND_URL` เหมาะเฉพาะเมื่อทดสอบ Next.js โดยตรงบน Port 3000 ไม่ใช่ผ่าน Nginx Port 8080 หากยังไม่ได้ใช้งาน OAuth สามารถปล่อยตัวแปรเหล่านี้ว่าง/ยังไม่ตั้งค่าได้ตามการใช้งานของระบบ

**ห้าม Commit** `backend/.env`, `frontend/.env.local`, `deploy/local/backend.env`, Private Keys หรือ Credentials ขึ้น GitHub

### 3. ติดตั้ง Dependencies และเริ่ม Container

```bash
docker compose run --rm frontend npm ci --include=optional
docker compose run --rm backend composer install
docker compose up -d --build
```

> หากขั้นตอน `docker compose run` มี Error เพราะบริการหรือไฟล์ Environment ยังไม่พร้อม ให้ตรวจ Log และ Compose Configuration ก่อน อย่าใช้ `down -v` เพื่อแก้ปัญหาแบบสุ่ม

### 4. สร้าง Application Key และ Database Tables

```bash
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
```

เฉพาะเครื่อง Local ที่ต้องการข้อมูลหมวดหมู่เริ่มต้น:

```bash
docker compose exec backend php artisan db:seed --class='Database\Seeders\CategorySeeder'
```

`CategorySeeder` เพิ่ม 4 หมวดหมู่โดยใช้ `firstOrCreate` ได้แก่ พระเครื่อง, รูปปั้นและทองเหลือง, เฟอร์นิเจอร์ไม้เก่า และของสะสมอื่นๆ

**คำเตือน:** `DatabaseSeeder` ปัจจุบันสร้างบัญชี `admin` สำหรับทดสอบจาก Factory ด้วย อย่ารัน `migrate --seed` หรือ `db:seed` แบบไม่ระบุ Class บน Production และอย่านำรหัสผ่านตัวอย่างไปใช้จริง

### 5. ตรวจระบบ Local

| Service | URL / Address | หมายเหตุ |
|---|---|---|
| Frontend ผ่าน Nginx | http://localhost:8080 | จุดเข้าเว็บแนะนำสำหรับทดสอบแบบ Same-origin |
| Laravel API ผ่าน Nginx | http://localhost:8080/api/products | ตรวจ API |
| Next.js โดยตรง | http://localhost:3000 | ใช้สำหรับตรวจ Frontend |
| PostgreSQL (Local เท่านั้น) | localhost:5432 | ตาม Docker Compose Development |

```bash
docker compose ps
docker compose logs --tail=100 backend frontend webserver db
```

## โครงสร้างสำคัญของ Repository

```text
frontend/                 # Next.js App Router
backend/                  # Laravel API, Models, Migrations, Seeders, Tests
docker/nginx/             # Nginx development/production configs
.github/workflows/        # CI, image publishing, production deployment
deploy/                   # Production environment/config/state (บางส่วนอยู่เฉพาะ VM)
scripts/                  # Deployment/backup utilities (ไฟล์ใช้งานจริงบน Azure VM)
docker-compose.yml        # Local Development
compose.prod.yml          # Production Compose template
Techstack.md              # รายละเอียด Tech Stack
```

ไฟล์ใน `deploy/local/`, Deployment State และ Scripts ที่ติดตั้งเฉพาะ Azure อาจไม่ตรงกับไฟล์ใน GitHub Repository; ตรวจใน VM ก่อนเปลี่ยน Infrastructure Configuration

## การพัฒนาและทดสอบก่อน Pull Request

```bash
# Frontend — Local Node.js 24
cd frontend
npm ci --include=optional
npm run lint
npx tsc --noEmit
npm run build
cd ..

# Backend — หากมี PHP/Composer บน Host หรือใช้ Backend Container
# docker compose exec backend php artisan test
```

สำหรับ GitHub CI ใช้ Node.js 24, ESLint, TypeScript, Next.js Build และ Laravel Tests โดย Backend Tests ใช้ SQLite in-memory ใน CI; การ Build ผ่านไม่เท่ากับ End-to-End Tests ผ่านทุกฟังก์ชัน

## Production และ CI/CD

1. พัฒนาโค้ดใน Feature Branch แล้วสร้าง Pull Request ไป `main`
2. GitHub Actions **Web Panaprisin CI** ตรวจ Frontend และ Backend
3. หลัง Merge, Workflow **Build and Publish Production Images** สร้าง Docker Images แบบ `sha-<40-character-commit-SHA>` ลง GHCR (เฉพาะ Commit ที่ตรงกับเงื่อนไข Workflow)
4. สร้าง Git Tag/Publish GitHub Release แบบ **ไม่ใช่ Pre-release** เพื่ออนุมัติ Deployment
5. Workflow **Deploy Production to Azure** ที่รับ `release: published` เรียก SSH Forced Command ไปยัง Azure VM
6. Azure ตรวจ Release, Commit/CI/Images ก่อน Backup Database → Deploy → Migration → Health Check → บันทึก SHA สำเร็จ

> เป็น **Approval-based Auto-CD**: การ Merge เข้า `main` เพียงอย่างเดียวยังไม่ Deploy Production จนกว่าจะ Publish Release. `workflow_dispatch` ใช้ทดสอบ/ดำเนินการด้วยมือเมื่อจำเป็น ไม่ใช่ขั้นตอนประจำวัน. ตัวตรวจฝั่ง Azure เลือก Release ล่าสุดที่ผ่านเงื่อนไข จึงควรหลีกเลี่ยงการอนุมัติหลาย Releases พร้อมกันจนกว่าจะพัฒนาให้ผูกกับ SHA จาก Event อย่างแน่นอน

**ตรวจ Production หลัง Deploy:**

```bash
curl -fI https://panaprisin.me/
curl -fI https://panaprisin.me/up
curl -fsS https://panaprisin.me/api/products
curl -fsS https://panaprisin.me/api/categories
```

การตรวจบน Azure VM (ผู้มีสิทธิ์เท่านั้น):

```bash
cd /opt/panaprisin
cat deploy/state/last-successful-sha
sudo systemctl status panaprisin-backup.timer --no-pager
sudo journalctl -u panaprisin-cd.service -n 60 --no-pager
```

Production เก็บฐานข้อมูลใน Persistent Docker Volume และมี Local PostgreSQL Backup ด้วย `pg_dump -Fc` ผ่าน systemd Timer; **ยังไม่ใช่ Offsite Backup** จำเป็นต้องมีแผนสำรองภายนอก VM และทดสอบ Restore เป็นระยะ

## การตั้งค่าและความปลอดภัย

- Local Development: `APP_ENV=local`, `APP_DEBUG=true` ได้เฉพาะเครื่องตัวเอง
- Production: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://panaprisin.me`, `SESSION_SECURE_COOKIE=true`
- `APP_KEY`, `DB_PASSWORD`, Google Client Secret และ SSH Keys ต้องเก็บเป็น Secret เท่านั้น หากหลุดให้ Rotate และพิจารณาผลกระทบต่อข้อมูลที่เข้ารหัส
- `CORS_ALLOWED_ORIGINS` เป็นรายชื่อ Origin ที่ Browser อนุญาตให้เข้าถึง API ข้าม Origin ไม่ใช่สิทธิ์การ Login
- Google OAuth ยังต้องแก้ Flow ที่ส่ง Access Token ผ่าน Query String ก่อนเปิดใช้จริง
- หน้า Checkout Success/QR Payment ปัจจุบันมีเนื้อหาตัวอย่าง; **ห้ามรับชำระเงินจริงโดยอาศัยหน้าดังกล่าว**

## Troubleshooting

**ดู Log:**

```bash
docker compose ps
docker compose logs --tail=100 frontend backend webserver db
```

**Restart Local Stack โดยไม่ลบ Volumes:**

```bash
docker compose down
docker compose up -d --build
```

> **อย่ารัน `docker compose down -v` โดยไม่ตั้งใจ** เพราะลบ Named Volumes และอาจทำให้ข้อมูล PostgreSQL ใน Local สูญหายได้ โดยเฉพาะห้ามใช้คำสั่งนี้กับ Production

**Permission Denied บน macOS/Linux:** ตรวจ `ls -ld` ของ Path ที่มีปัญหาก่อน แก้ Ownership เฉพาะ Path นั้น ไม่ควรใช้ `sudo chown -R ... .` ทั้ง Repository โดยไม่จำเป็น

**Missing `lightningcss.darwin-arm64.node` บน Mac:** ใช้ Node.js 24 สำหรับ Local ตาม CI แล้วลอง `rm -rf node_modules .next && npm ci --include=optional` จากโฟลเดอร์ `frontend` โดยเก็บ `package-lock.json` ไว้

**`The selected category id is invalid`:** ตรวจ `GET /api/categories`, Database Categories และให้ Dropdown ส่ง `category.id` ที่มีอยู่จริง ไม่ใช้ ID ตายตัว

**Deployment Failure:** ตรวจ GitHub Actions, `journalctl -u panaprisin-cd.service`, `deploy/state/failed-deployment-sha` และ Backup ก่อนดำเนินการซ้ำ ระบบยังไม่มี Automatic Rollback ที่ครอบคลุม Database Migrations ทุกกรณี
