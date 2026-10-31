# รายงาน Quality / Reliability / Security — 31 ตุลาคม 2026

เริ่ม Audit จาก main `05d9165` และ fetch ซ้ำก่อนส่งมอบพบ main ขยับเป็น `fad3f99` ซึ่งเป็น commit Phase 1 เดียวกับฐานของงานนี้ จึงไม่มีความต่างใหม่ที่ต้องรวม ผู้ดำเนินงานไม่ได้ push main, merge, deploy, restart Azure, แก้ secrets หรือแตะ production database

## Phase 1 — Production และ CI/CD

Root cause ที่ยืนยันจาก [run 41189371948](https://github.com/FIRSTNASAPONG/Web_Panaprisin/actions/runs/41189371948): health probes เรียก curl โดยไม่มี URL (`curl: (2) no URL specified` / HTTP000) หลัง SSH, image pull และ migration สำเร็จ ไม่สามารถสรุปว่า application ล่มจากผลนี้ได้ ไม่มี deploy.sh/auto-deploy.sh ใน repository จึงยังยืนยันบรรทัดที่ผิดบน Azure ไม่ได้

ไฟล์: `.github/workflows/{ci,auto-release-deploy}.yml`, `scripts/check-health.sh`, `tests/health-check-test.py`, [Azure safe patch](azure-health-patch.md). เพิ่ม standalone probe ที่ตรวจ URL/status จริงและ fail closed, concurrency deployment ร่วมกัน, CI PostgreSQL และ Compose validation ไม่มี API/Migration ใหม่ใน Phase นี้

ผล: health tests 5 ผ่าน และ shell syntax ผ่าน ล่าสุด CI ของ main fad3f99 [run 41204145974](https://github.com/FIRSTNASAPONG/Web_Panaprisin/actions/runs/41204145974) สำเร็จ ผล CI ไม่ใช่หลักฐานว่า Azure scripts ถูกแก้แล้ว ผู้ดูแลยังต้องตรวจ source จริง, ติดตั้ง patch และตรวจ deployment state ตามเอกสารก่อน deploy ครั้งถัดไป

## Phase 2 — Transaction integrity

Root cause: ยอดรวมเกิน numeric(10,2) ไม่ถูกตรวจ, cart mutations ไม่ใช้ lock ร่วมกับ checkout/ไม่ตรวจ buyer ซ้ำ, seller แสดงชื่อสินค้าปัจจุบันแทน snapshot, admin ไม่เห็น payment audit

ไฟล์: `CartController.php`, `OrderController.php`, `frontend/src/app/admin/orders/page.tsx`, `frontend/src/types/api.ts`, `TransactionIntegrityTest.php`. ดู [รายละเอียด](transaction-audit.md). ใช้ API เดิมทั้งหมด

Migration แบบ additive: `2026_10_31_000003_harden_cart_integrity_and_lookup_indexes.php` เพิ่ม unique cart/product และ lookup indexes; ถ้ามีข้อมูลซ้ำจะหยุดก่อนแก้ schema ไม่ลบข้อมูล ผล targeted tests 3/28 และรวม PostgreSQL รอบสุดท้ายผ่าน ข้อจำกัด: ยังไม่ได้ multi-worker stress test; ผู้ดูแลต้องตรวจ legacy duplicates และผลกระทบ index locks ก่อน migration production

## Phase 3 — Authentication / Authorization

Root cause และไฟล์ทั้งหมดอยู่ใน [Security PR brief](security-pr.md): OAuth stateless, password ถูกเขียนทับ, query token และ URL role fallback, CSRF exclusion กว้างเกิน, login ไม่มี limiter

แก้ SocialAuthController, API/web routes, bootstrap, Sanctum/services/provider config, login/callback frontend และ AuthSecurityTest แยก commit `4da9e56` บน `feature/security-oauth-hardening`. URL OAuth เดิมย้ายเข้า web middleware เพื่อใช้ state/session; ไม่มี schema ใหม่ Tests 8/51 และรวม PostgreSQL ผ่าน

ความเสี่ยง: ต้องตรวจ Google consent จริงและ session cookie/store บน staging; ทดสอบ provider success ด้วย test double เฉพาะ automated tests ส่วน browser callback ใช้ token ที่ระบบออกจริง ไม่ใช่ Google E2E. ยังใช้ localStorage bearer เดิม ต้อง deploy front/back พร้อมกันหลัง review เท่านั้น

## Phase 4 — UX และ Accessibility

Root cause: failed cart delete ทำให้ UI ลบสินค้าทั้งที่ backend ปฏิเสธ, network errors บางหน้าแสดงเป็น empty, invalid product ID loading ค้าง, category IDs เป็นรายการ hardcode, controls ไม่มี accessible names, seller mobile ไม่มี navigation, seller orders แสดงเฉพาะหน้าแรก

ไฟล์: `frontend/src/context/CartContext.tsx`, `components/{Navbar,ProductGrid}.tsx`, `app/{cart,login,signup}/page.tsx`, `app/product/[id]/page.tsx`, `app/seller/{layout,add-product/page,orders/page,products/page}.tsx`, types และ browser tests. แก้ loading/error/retry, mutation state ตาม server, category จาก DB, labels, modal focus/Escape และ pagination โดยคง theme #1B4D3E, branding, Navbar/Footer และ Seller Centre

ผล: audit 24 routes × desktop1280/mobile390 = 48 checks ผ่าน ไม่มี horizontal overflow, unnamed visible controls หรือ uncaught pageerror ตาม checks ที่กำหนด ดู [audit.json](../evidence/quality/audit.json). ไม่ใช่การรับรอง WCAG ทั้งหมดหรือ visual pixel comparison. baseline audit มี false positives ของ controls ใน details ที่ปิดอยู่ จึงแก้ visibility filter ก่อนผลสุดท้าย

## Phase 5 — Database / Documentation

อัปเดต [ER/EER](../er-eer.md) ตาม migration จริง เพิ่ม `DatabaseIntegrityTest.php` ตรวจ unique/FK และ migration ปฏิเสธ legacy duplicate โดยไม่เปลี่ยนแถว (2 tests ผ่านทั้ง PostgreSQL/SQLite). ไม่มี migration ใหม่เพิ่มเติมใน Phase นี้ และไม่มี Reviews/Sales Report API ซ้ำ ดู [Demo script](demo-script.md)

## Phase 6 — หลักฐาน validation

| รายการที่รันจริง | ผล |
|---|---|
| `npm run lint` | ผ่าน exit 0 |
| `npx tsc --noEmit` | ผ่าน exit 0 |
| `npm run build` (Next 15.5.26) | ผ่าน 26 static pages, dynamic routes ตาม build output |
| `php artisan test --no-ansi` SQLite memory | 28 tests / 323 assertions ผ่าน |
| Docker PHP8.3 + PostgreSQL test DB | 28 tests / 323 assertions ผ่าน |
| `python3 tests/health-check-test.py` | 5 tests ผ่าน |
| `docker compose config --quiet` | ผ่าน exit 0 |
| `quality-audit.mjs` | 48 route/viewport checks ผ่าน |
| `reliability-browser.mjs` | password login ทั้งสาม roles, failed delete ownership, offline cart, product/seller retry, modal keyboard, mobile nav, callback cleanup ผ่าน |
| `requirements-browser.mjs` | wishlist/reviews/rating/admin/reports/role guards บน DB จริงผ่าน |
| `ecommerce-browser.mjs` | checkout/stock/idempotency/ownership/profile/seller snapshot ผ่าน |
| `git diff --check` | ผ่าน |

Browser ใช้ Chromium กับ Next dev :3100 และ Laravel :8091, isolated PostgreSQL `panaprisin_ecommerce_test`; ไม่ได้รัน browser against production build หรือ Azure. Backend tests รันหลัง browser จบเพื่อไม่ reset fixtures ระหว่าง E2E. Test fixtures เป็นแถวจริงใน test DB ไม่ใช่ mock endpoint. Intentional network abort อาจทำให้ Next dev แสดง issue badge ใน screenshot; ไม่มี uncaught pageerror ไม่ได้แปลว่า console ไร้ expected network error

ภาพจริง: [Seller mobile](../evidence/quality/seller-mobile.png), [Admin orders](../evidence/quality/admin-orders-desktop.png), [Wishlist](../evidence/quality/requirements/requirements-wishlist-mobile.png), [Approved review](../evidence/quality/requirements/requirements-approved-review.png), [Admin sales](../evidence/quality/requirements/requirements-admin-report.png), [Seller sales](../evidence/quality/requirements/requirements-seller-report-mobile.png), [Buyer checkout](../evidence/quality/regression/buyer-confirmation-desktop.png)

Branches เป็น stacked commits: reliability `fad3f99` → commerce `5683446` → security `4da9e56` → UX/validation. Security ควร review เฉพาะ diff กับ commerce branch และ retarget หลังฐานรวมแล้ว ห้าม merge/deploy โดยอัตโนมัติ ยังไม่อ้างว่า remote CI ของแต่ละ feature branch ผ่าน
