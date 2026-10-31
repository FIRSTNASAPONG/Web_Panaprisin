"use client";
import { useState } from 'react';
import { AdminList, actionClass } from '@/components/admin/AdminList';
import ProductForm from '@/components/admin/ProductForm';
import { errorMessage } from '@/lib/account';
import api from '@/lib/axios';
import type { Product } from '@/types/api';
export default function ProductsPage() {
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function create(action: () => Promise<unknown>) { setBusy(true); try { await action(); setMessage('เพิ่มสินค้าสำเร็จ'); setVersion(v => v + 1); } catch (err) { setMessage(errorMessage(err)); } finally { setBusy(false); } }
  return <><details className="bg-white p-4 border rounded mb-6"><summary>เพิ่มสินค้าใหม่</summary><ProductForm key={version} run={create} busy={busy} /><p role="status">{message}</p></details>
    <AdminList<Product & { is_active: boolean }> key={version} path="/admin/products" title="จัดการสินค้า" render={(product, run, saving) => <>
      <h2 className="font-bold">#{product.id} {product.name} — {product.is_active ? 'เปิดขาย' : 'ปิดขาย'}</h2><p>ผู้ขาย #{product.user_id}</p>
      {product.is_active && <><details><summary className="cursor-pointer my-3">แก้ไขสินค้า</summary><ProductForm product={product} run={run} busy={saving} /></details><button disabled={saving} className={actionClass} onClick={() => { if (confirm('ปิดการขายสินค้า? ประวัติคำสั่งซื้อจะยังอยู่')) void run(() => api.delete(`/admin/products/${product.id}`)); }}>ปิดการขาย</button></>}
    </>} />
  </>;
}
