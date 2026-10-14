"use client";

import Image from "next/image";

import { isAxiosError } from "axios";
import type { ApiError } from "@/types/api";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useCart } from '../../context/CartContext'; // 🟢 ดึง CartContext มาซิงค์ตอน Login
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { fetchCartFromDB } = useCart();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await api.post('/login', { email, password });
      const data = res.data;
      
      // เก็บ Token และข้อมูล User
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // 🟢 ซิงค์ข้อมูลตะกร้าจากฐานข้อมูลทันทีที่ Login สำเร็จ (ตาม P0 Checklist)
      await fetchCartFromDB();
      
      if (data.user.role === 'seller' || data.user.role === 'admin') {
        router.push('/seller');
      } else {
        router.push('/');
      }
      
    } catch (error: unknown) {
      const errorData = isAxiosError<ApiError>(error) ? error.response?.data : undefined;
      console.error('Login error:', error);
      const backendMessage = errorData?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      setErrorMessage(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      <header className="bg-white py-5 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-3xl font-bold text-[#1B4D3E] tracking-wider hover:opacity-90">พณาไพรสิน</Link>
            <span className="text-2xl text-gray-800 font-medium md:text-2xl">เข้าสู่ระบบ</span>
          </div>
        </div>
      </header>

      <div className="bg-[#1B4D3E] flex-grow flex items-center py-10">
        <div className="container mx-auto px-4 max-w-5xl flex justify-center md:justify-between items-center gap-8">
          
          <div className="hidden md:block w-3/5 h-[480px]">
            <Image unoptimized loading="eager" width={600} height={800}
              src="/image_289eb4.jpg" 
              alt="ของเก่าโบราณ พณาไพรสิน" 
              className="w-full h-full object-cover rounded-md shadow-2xl border-4 border-white/10"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x800/1B4D3E/FFFFFF?text=Panaprisin' }}
            />
          </div>

          <div className="w-full max-w-[400px] bg-white rounded-sm shadow-xl p-8">
            <h2 className="text-xl text-gray-900 font-bold mb-6">เข้าสู่ระบบ</h2>
            
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-sm mb-6 text-sm font-medium shadow-sm">
                {errorMessage}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="อีเมล (Email)" 
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-400 font-medium transition"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน (Password)" 
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-400 font-medium transition"
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-sm font-bold shadow-sm uppercase mt-2 transition ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-100 cursor-not-allowed' 
                    : 'bg-[#1B4D3E] text-white hover:bg-[#143a2f]'
                }`}
              >
                {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
              </button>

              <div className="flex justify-between items-center text-sm text-[#1B4D3E] mt-4 font-medium">
                <a href="#" className="hover:underline">ลืมรหัสผ่าน?</a>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600 font-medium">
              เพิ่งเคยเข้ามาใน พณาไพรสิน ใช่หรือไม่? <Link href="/signup" className="text-[#1B4D3E] font-bold hover:underline ml-1">สมัครใหม่</Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm font-medium">
            © 2026 พณาไพรสิน (Panaprisin) - ของสะสมและของเก่าโบราณ. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}