"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios'; // นำเข้า axios

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // 1. เพิ่ม State สำหรับจัดการ Loading
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true); // เริ่มหมุน Loading

    try {
      // ยิง API ด้วย Axios
      const res = await api.post('/login', { email, password });
      
      const data = res.data;
      
      // เก็บ Token
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      // 2. เปลี่ยนจากการเด้ง Alert เป็นการแสดงข้อความสีแดงใน UI
      const backendMessage = error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      setErrorMessage(backendMessage);
    } finally {
      setIsLoading(false); // ปิด Loading ไม่ว่าจะสำเร็จหรือพัง
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      <header className="bg-white py-5 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" className="text-3xl font-bold text-[#1B4D3E] tracking-wider hover:opacity-90">พณาไพรสิน</a>
            <span className="text-2xl text-gray-800 font-medium md:text-2xl">เข้าสู่ระบบ</span>
          </div>
        </div>
      </header>

      <div className="bg-[#1B4D3E] flex-grow flex items-center py-10">
        <div className="container mx-auto px-4 max-w-5xl flex justify-center md:justify-between items-center gap-8">
          
          <div className="hidden md:block w-3/5 h-[480px]">
            <img 
              src="/image_289eb4.jpg" 
              alt="ของเก่าโบราณ พณาไพรสิน" 
              className="w-full h-full object-cover rounded-md shadow-2xl border-4 border-white/10"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x800/1B4D3E/FFFFFF?text=Panaprisin' }}
            />
          </div>

          <div className="w-full max-w-[400px] bg-white rounded-sm shadow-xl p-8">
            <h2 className="text-xl text-gray-900 font-bold mb-6">เข้าสู่ระบบ</h2>
            
            {/* กล่องแดงจะแสดงก็ต่อเมื่อมี errorMessage */}
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
              เพิ่งเคยเข้ามาใน พณาไพรสิน ใช่หรือไม่? <a href="/signup" className="text-[#1B4D3E] font-bold hover:underline ml-1">สมัครใหม่</a>
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