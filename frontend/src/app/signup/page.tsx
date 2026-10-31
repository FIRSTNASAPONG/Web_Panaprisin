"use client";

import Image from "next/image";
import { isAxiosError } from "axios";
import type { ApiError } from "@/types/api";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== passwordConfirmation) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/register', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password: password,
        password_confirmation: passwordConfirmation,
        role: role,
      });

      const data = res.data;

      if (data.access_token || data.token) {
        localStorage.setItem('token', data.access_token || data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        alert('สมัครสมาชิกสำเร็จ!');
        if (role === 'seller') {
          router.push('/seller');
        } else {
          router.push('/');
        }
      } else {
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        router.push('/login');
      }
    } catch (error: unknown) {
      const errorData = isAxiosError<ApiError>(error) ? error.response?.data : undefined;
      console.warn('Signup validation error:', errorData);

      const errors = errorData?.errors;
      if (errors) {
        const firstError = Object.values(errors).flat().join('\n');
        setErrorMessage(firstError);
      } else {
        setErrorMessage(
          errorData?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาตรวจสอบข้อมูลอีกครั้ง'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🟢 ฟังก์ชันกดปุ่มสมัคร/เข้าสู่ระบบด้วย Google
  const handleGoogleLogin = () => {
    window.location.href = `${apiUrl}/auth/google/redirect`;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      <header className="bg-white py-5 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-3xl font-bold text-[#1B4D3E] tracking-wider hover:opacity-90">
              พณาไพรสิน
            </Link>
            <span className="text-2xl text-gray-800 font-medium">สมัครใหม่</span>
          </div>
        </div>
      </header>

      <div className="bg-[#1B4D3E] flex-grow flex items-center py-10">
        <div className="container mx-auto px-4 max-w-5xl flex justify-center md:justify-between items-center gap-8">
          <div className="hidden md:block w-3/5 h-[480px]">
            <Image unoptimized loading="eager" width={600} height={800}
              src="/image_289eb4.jpg"
              alt="พณาไพรสิน"
              className="w-full h-full object-cover rounded-md shadow-2xl border-4 border-white/10"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x800/1B4D3E/FFFFFF?text=Panaprisin';
              }}
            />
          </div>

          <div className="w-full max-w-[420px] bg-white rounded-sm shadow-xl p-8">
            <h2 className="text-xl text-gray-900 font-bold mb-6">สมัครสมาชิก</h2>

            {errorMessage && (
              <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-sm mb-6 text-sm font-medium whitespace-pre-line">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-label="ชื่อจริง" placeholder="ชื่อจริง"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-label="นามสกุล" placeholder="นามสกุล"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
                />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="อีเมล (Email)" placeholder="อีเมล (Email)"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)" placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
              />

              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                aria-label="ยืนยันรหัสผ่านอีกครั้ง" placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
              />

              <div className="flex items-center gap-6 pt-2 text-sm text-gray-700 font-medium">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === 'buyer'}
                    onChange={() => setRole('buyer')}
                    className="text-[#1B4D3E] focus:ring-[#1B4D3E]"
                  />
                  ผู้ซื้อทั่วไป
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={role === 'seller'}
                    onChange={() => setRole('seller')}
                    className="text-[#1B4D3E] focus:ring-[#1B4D3E]"
                  />
                  ผู้ขายสินค้า
                </label>
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
                {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
              </button>
            </form>

            {/* 🟢 เส้นคั่น และปุ่มสมัครด้วย Google */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="bg-white px-3 text-xs text-gray-600 uppercase font-medium">หรือ</span>
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

            <div className="mt-5 text-center text-xs text-gray-500">
              โดยการสมัครสมาชิก คุณได้อ่านและยอมรับ เงื่อนไขการให้บริการ และ นโยบายความเป็นส่วนตัว ของ พณาไพรสิน
            </div>

            <div className="mt-4 text-center text-sm text-gray-600 font-medium">
              หากมีบัญชีผู้ใช้แล้ว คุณสามารถ{' '}
              <Link href="/login" className="text-[#1B4D3E] font-bold hover:underline">
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}