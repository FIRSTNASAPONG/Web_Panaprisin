"use client";

import Image from "next/image";
import { isAxiosError } from "axios";
import type { ApiError } from "@/types/api";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useCart } from '../../context/CartContext';
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { fetchCartFromDB } = useCart();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  // 🟢 ดักรับ token กรณีที่ SocialAuthController redirect กลับมาพร้อม ?token=...
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token') || params.get('access_token');
    const errorFromUrl = params.get('error');

    if (errorFromUrl) {
      setErrorMessage('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง');
      return;
    }

    if (tokenFromUrl) {
      setIsLoading(true);
      localStorage.setItem('token', tokenFromUrl);

      fetch(`${apiUrl}/user`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${tokenFromUrl}`,
        },
      })
        .then(async (res) => {
          if (res.ok) {
            const userData = await res.json();
            localStorage.setItem('user', JSON.stringify(userData));
            await fetchCartFromDB();
            if (userData.role === 'seller' || userData.role === 'admin') {
              window.location.href = '/seller';
            } else {
              window.location.href = '/';
            }
          } else {
            setErrorMessage('ไม่สามารถดึงข้อมูลผู้ใช้งานจาก Google ได้');
            setIsLoading(false);
          }
        })
        .catch(() => {
          setErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
          setIsLoading(false);
        });
    }
  }, [apiUrl, fetchCartFromDB]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await api.post('/login', { email, password });
      const data = res.data;
      
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      await fetchCartFromDB();
      
      if (data.user.role === 'seller' || data.user.role === 'admin') {
        router.push('/seller');
      } else {
        router.push('/');
      }
      
    } catch (error: unknown) {
      const errorData = isAxiosError<ApiError>(error) ? error.response?.data : undefined;
      console.warn('Login error:', error);
      const backendMessage = errorData?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      setErrorMessage(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 ฟังก์ชันกดปุ่มเข้าสู่ระบบด้วย Google
  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/auth/google/redirect`;
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

            {/* 🟢 เส้นคั่น และปุ่มเข้าสู่ระบบด้วย Google */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="bg-white px-3 text-xs text-gray-400 uppercase font-medium">หรือ</span>
              <div className="border-t border-gray-300 w-full"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm flex items-center justify-center gap-3 shadow-sm transition"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              ดำเนินการต่อด้วย Google
            </button>

            <div className="mt-6 text-center text-sm text-gray-600 font-medium">
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