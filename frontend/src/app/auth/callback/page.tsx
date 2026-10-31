"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";


export default function AuthCallbackPage() {
  const router = useRouter();
  const started = useRef(false);
  const { fetchCartFromDB } = useCart();
  const [statusText, setStatusText] = useState("กำลังเข้าสู่ระบบด้วย Google...");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const handleCallback = async () => {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const token = fragment.get('token');
      window.history.replaceState(null, '', '/auth/callback');
      if (!token) { router.replace('/login?error=GoogleLoginFailed'); return; }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/user`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, cache: 'no-store',
        });
        if (!res.ok) throw new Error('Invalid login');
        const user = await res.json();
        if (!user.id || !['buyer','seller','admin'].includes(user.role)) throw new Error('Invalid user');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('user-updated'));
        setStatusText('กำลังซิงค์ข้อมูลตะกร้าสินค้า...');
        await fetchCartFromDB();
        router.replace(user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/');
      } catch {
        setStatusText('เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
        router.replace('/login?error=GoogleLoginFailed');
      }
    };

    void handleCallback();
  }, [fetchCartFromDB, router]);

  return (
    <div className="min-h-screen bg-[#1B4D3E] flex items-center justify-center font-sans px-4">
      <div className="bg-white p-8 rounded-sm shadow-xl max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-lg font-bold text-gray-900">{statusText}</h2>
        <p className="text-xs text-gray-500">กรุณารอสักครู่ ระบบกำลังพาท่านเข้าสู่หน้าเว็บไซต์</p>
      </div>
    </div>
  );
}