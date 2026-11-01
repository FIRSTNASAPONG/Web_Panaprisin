> หลักฐานต้นฉบับย้อนหลัง: ไม่ใช่ผลทดสอบรอบปัจจุบัน โปรดใช้ [Final Project Documentation v1.0](../../README.md)

# Phase 2 — Transaction integrity

Base main 05d9165. Confirmed: numeric(10,2) aggregate overflow not validated (SQLite reproduced 201 for 199999999.98; PostgreSQL would reject storage); cart update/delete did not participate in checkout locks and did not recheck buyer role; seller order lines used mutable product names; payment audit hidden even from Admin.

Changes: OrderController validates max total before any writes and exposes audit only in Admin list, uses product_name snapshot for Seller; CartController serializes writes using user→cart→product locks and scopes item lookup to owner; admin UI shows verifier/reference/time; additive migration unique(cart_id,product_id) and lookup indexes. Existing duplicate carts halt migration for manual review, no data rewrite.

Tests: new TransactionIntegrityTest initially failed 3 tests; after fixes SQLite 3 tests/28 assertions and PostgreSQL full suite 18 tests/267 assertions passed. Includes cancelled-key replay preserving a new cart, repeat cancellation no double restock, confirm cancelled order 409, audit overwrite denied, buyer/seller audit hidden.

Risks/remaining: PostgreSQL row locking is exercised in sequential feature tests, not a multi-worker load proof. Manual payment references still require actual bank reconciliation; no automatic transfer verification/refund. Before migration inspect `SELECT cart_id, product_id, COUNT(*) FROM cart_items GROUP BY cart_id, product_id HAVING COUNT(*) > 1;` and review duplicates outside this task. Index creation may take locks on large production tables; schedule by operator. No production migration run.
