"use client";
import { useState } from 'react';
import { useAccountData } from '@/lib/account';
import api from '@/lib/axios';
import type { Product } from '@/types/api';
import { actionClass } from './AdminList';
export default function ProductForm({ product, run, busy }: { product?: Product; run: (action: () => Promise<unknown>) => Promise<void>; busy: boolean }) {
  const [categoryId, setCategoryId] = useState(String(product?.category_id || ''));
  const { data: categories, error } = useAccountData<{ id: number; name: string }[]>('/categories');
  return <form className="grid sm:grid-cols-2 gap-3 my-3" onSubmit={e => {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    const data = { name: form.get('name'), description: form.get('description'), price: form.get('price'), stock_quantity: form.get('stock'), category_id: form.get('category') };
    void run(() => product ? api.patch(`/admin/products/${product.id}`, data) : api.post('/admin/products', data));
  }}>
    <label>ชื่อสินค้า<input className="border rounded p-2 block w-full" name="name" defaultValue={product?.name} required maxLength={255} /></label>
    <label>หมวดหมู่<select className="border rounded p-2 block w-full" name="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} required><option value="">เลือกหมวดหมู่</option>{categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>ราคา<input className="border rounded p-2 block w-full" name="price" type="number" min="0" step="0.01" defaultValue={product?.price} required /></label>
    <label>สต็อก<input className="border rounded p-2 block w-full" name="stock" type="number" min="0" step="1" defaultValue={product?.stock_quantity ?? 0} required /></label>
    <label className="sm:col-span-2">รายละเอียด<textarea className="border rounded p-2 block w-full" name="description" maxLength={10000} defaultValue={product?.description || ''} /></label>
    {error && <p role="alert">{error}</p>}<button disabled={busy || !categories} className={actionClass}>{product ? 'บันทึกสินค้า' : 'เพิ่มสินค้า'}</button>
  </form>;
}
