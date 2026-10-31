import Link from 'next/link';
import type { ReactNode } from 'react';
import RoleGuard from '@/components/RoleGuard';
export default function SellerLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="seller"><nav aria-label="Seller Centre บนมือถือ" className="md:hidden bg-[#1B4D3E] text-white p-3 flex flex-wrap gap-3 text-sm">{[['/seller','ภาพรวม'],['/seller/products','สินค้า'],['/seller/add-product','เพิ่มสินค้า'],['/seller/orders','คำสั่งซื้อ'],['/seller/reports','ยอดขาย'],['/','หน้าร้าน']].map(([href,label]) => <Link key={href} href={href}>{label}</Link>)}</nav>{children}</RoleGuard>;
}
