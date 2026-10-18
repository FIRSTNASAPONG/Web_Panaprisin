import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5f5f5] flex flex-col text-gray-800"><Navbar/><main className="container mx-auto max-w-6xl px-4 py-8 flex-grow"><nav aria-label="เส้นทางนำทาง" className="mb-4 text-sm"><Link href="/">พณาไพรสิน</Link> › <Link href="/account">บัญชีของฉัน</Link></nav><nav aria-label="เมนูบัญชี" className="flex flex-wrap gap-4 mb-6 text-[#1B4D3E] underline"><Link href="/account">ภาพรวมบัญชี</Link><Link href="/account/orders">คำสั่งซื้อของฉัน</Link><Link href="/account/profile">แก้ไขข้อมูลส่วนตัว</Link></nav>{children}</main><Footer/></div>;
}
