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
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-sm mb-6 text-sm font-medium whitespace-pre-line">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ชื่อจริง"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="นามสกุล"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
                />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมล (Email)"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900"
              />

              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
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

            <div className="mt-6 text-center text-xs text-gray-500">
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