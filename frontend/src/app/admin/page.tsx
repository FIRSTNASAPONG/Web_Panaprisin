"use client";
import Link from 'next/link';
import { useAccountData } from '@/lib/account';
export default function AdminPage() {
  const { data, error, loading, retry } = useAccountData<{ users: number; products: number; orders: number; pending_reviews: number }>('/admin/overview');
  return <main><h1 className="text-2xl font-bold text-[#1B4D3E] mb-5">ภาพรวมระบบ</h1>{loading && <p>กำลังโหลด...</p>}{error && <p role="alert">{error} <button onClick={retry}>ลองอีกครั้ง</button></p>}
    {data && <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[['users','ผู้ใช้',data.users],['products','สินค้า',data.products],['orders','คำสั่งซื้อ',data.orders],['reviews','รีวิวรอตรวจสอบ',data.pending_reviews]].map(([path,label,count]) => <Link className="bg-white border p-6 rounded" key={path} href={`/admin/${path}`}><p>{label}</p><strong className="text-3xl text-[#1B4D3E]">{count}</strong></Link>)}</div>}
  </main>;
}
