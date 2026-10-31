"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAccountData, errorMessage } from '@/lib/account';
import api from '@/lib/axios';
import type { Product } from '@/types/api';
import { useState } from 'react';

export default function WishlistPage() {
  const { data, error, loading, retry } = useAccountData<{ id: number; product_id: number; product: Product & { is_active: boolean } }[]>('/wishlist');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  return <div className="min-h-screen flex flex-col bg-gray-50"><Navbar /><main className="w-full max-w-5xl mx-auto p-6 flex-1">
    <h1 className="text-2xl font-bold text-[#1B4D3E] mb-6">รายการโปรด</h1>
    {loading && <p>กำลังโหลด...</p>}
    {error && <div role="alert">{error} <button onClick={retry}>ลองอีกครั้ง</button> <Link href="/login">เข้าสู่ระบบ</Link></div>}
    <p role="status">{message}</p>
    {data?.length === 0 && <p>ยังไม่มีสินค้าในรายการโปรด <Link href="/">เลือกสินค้า</Link></p>}
    <div className="grid sm:grid-cols-2 gap-4">{data?.map(item => <article key={item.id} className="bg-white border rounded p-5">
      {item.product?.is_active ? <Link className="font-bold text-[#1B4D3E]" href={`/product/${item.product_id}`}>{item.product.name}</Link> : <p>{item.product?.name} — สินค้าไม่เปิดขายแล้ว</p>}
      <p>฿{Number(item.product?.price || 0).toLocaleString()}</p>
      <button disabled={busy !== null} className="mt-3 underline disabled:opacity-50" onClick={async () => {
        setBusy(item.id); setMessage('');
        try { await api.delete(`/wishlist/${item.product_id}`); retry(); }
        catch (err) { setMessage(errorMessage(err)); }
        finally { setBusy(null); }
      }}>นำออกจากรายการโปรด</button>
    </article>)}</div>
  </main><Footer /></div>;
}
