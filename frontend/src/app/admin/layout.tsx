import Link from 'next/link';
import type { ReactNode } from 'react';
import RoleGuard from '@/components/RoleGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex flex-col bg-gray-50"><Navbar /><RoleGuard role="admin"><div className="max-w-6xl w-full mx-auto p-4 flex-1">
    <nav aria-label="Admin" className="bg-[#1B4D3E] text-white rounded p-4 flex flex-wrap gap-5 mb-6">{[['', 'Admin Dashboard'], ['/users','ผู้ใช้'], ['/products','สินค้า'], ['/orders','คำสั่งซื้อ'], ['/reviews','รีวิว'], ['/reports','รายงานยอดขาย']].map(([path,label]) => <Link key={path} href={`/admin${path}`}>{label}</Link>)}</nav>
    {children}
  </div></RoleGuard><Footer /></div>;
}
