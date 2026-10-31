"use client";

import type { User } from "@/types/api";
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function Navbar() {
  const { cart, clearCart } = useCart(); 
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        setUser(JSON.parse(userString));
      } catch {
        setUser(null);
      }
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearchTerm(q);
    }
  }, []);

  useEffect(() => {
    const refreshUser = () => {
      try { setUser(JSON.parse(localStorage.getItem('user') || 'null')); }
      catch { setUser(null); }
    };
    window.addEventListener('user-updated', refreshUser);
    return () => window.removeEventListener('user-updated', refreshUser);
  }, []);

  // 🟢 ฟังก์ชันค้นหาสินค้าเมื่อกดปุ่มแว่นขยายหรือกด Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      router.push(`/?search=${encodeURIComponent(trimmed)}#products`);
    } else {
      router.push('/');
    }
  };

  // 🟢 ยิง POST /api/logout เพื่อ revoke token ตาม P1 Checklist
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

    if (token) {
      try {
        await fetch(`${apiUrl}/logout`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Logout error:', error);
      }
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearCart();
    setUser(null);
    alert('ออกจากระบบสำเร็จ');
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <>
      <div className="bg-[#143a2f] text-white text-sm py-1">
        <div className="container mx-auto px-4 flex flex-wrap gap-2 justify-between items-center max-w-6xl">
          <div className="flex space-x-4">
            <Link href="/seller" className="hover:text-gray-300">Seller Centre</Link>
            <span className="border-l border-gray-500"></span>
            <Link href="/seller/add-product" className="hover:text-gray-300">เริ่มต้นขายสินค้า</Link>
            <span className="border-l border-gray-500"></span>
            <div className="flex items-center space-x-2 hidden sm:flex">
              <span>ติดตามเราบน</span>
              <a href="https://www.facebook.com/panaprisin?locale=th_TH" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
            <a href="#" className="hover:text-gray-300 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              ไทย
            </a>
            
            {user ? (
              <>
                <Link href="/wishlist" className="hover:underline">รายการโปรด</Link>
                {user.role === 'admin' && <Link href="/admin">Admin Dashboard</Link>}
                {user.role === 'buyer' && <Link href="/account" className="hover:underline">บัญชีของฉัน</Link>}
                <span className="font-bold text-green-200 ml-2">
                  สวัสดี, {user.first_name || user.name || 'ผู้ใช้งาน'}
                </span>
                <span className="border-l border-gray-500 h-3"></span>
                <button onClick={handleLogout} className="hover:text-red-300 transition text-sm">ออกจากระบบ</button>
              </>
            ) : (
              <>
                <Link href="/signup" className="hover:text-gray-300 font-bold">สมัครใหม่</Link>
                <span className="border-l border-gray-500 h-3"></span>
                <Link href="/login" className="hover:text-gray-300 font-bold">เข้าสู่ระบบ</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header className="bg-[#1B4D3E] text-white pt-6 pb-4 sticky top-0 z-50 shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 sm:gap-8">
            <Link
              href="/"
              onClick={() => setSearchTerm('')}
              className="flex-shrink-0 flex items-center gap-3 cursor-pointer hover:opacity-90 transition"
            >
              <h1 className="text-3xl font-bold tracking-wider">พณาไพรสิน</h1>
              <span className="border-l-2 border-white/30 h-6 hidden md:block"></span>
              <span className="text-sm font-medium text-green-200 hidden md:block">ของสะสม & ของเก่าโบราณ</span>
            </Link>

            {/* 🟢 ช่องค้นหาที่ใช้งานได้จริง */}
            <form onSubmit={handleSearch} className="order-last sm:order-none w-full sm:w-auto min-w-0 flex-grow max-w-xl">
              <div className="flex bg-white rounded-sm overflow-hidden p-1 items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="ค้นหาสินค้า"
                  placeholder="ค้นหาสินค้า และร้านค้า..."
                  className="min-w-0 w-full flex-grow px-4 py-1.5 text-gray-800 outline-none text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      router.push('/');
                    }}
                    className="px-2 text-gray-600 hover:text-gray-600 text-xs font-bold"
                    title="ล้างคำค้นหา"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  aria-label="ค้นหา"
                  className="bg-[#1B4D3E] px-6 py-1.5 rounded-sm hover:bg-[#143a2f] transition text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </button>
              </div>
            </form>

            <Link href="/cart" className="flex-shrink-0 mr-4 cursor-pointer hover:opacity-80 transition relative block">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1B4D3E]">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}