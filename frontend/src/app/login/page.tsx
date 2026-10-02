"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function LoginPage() {
  // สร้าง State สำหรับเก็บค่าจากช่อง Input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();

  // ฟังก์ชันจัดการเมื่อกดปุ่ม "เข้าสู่ระบบ"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีเฟรช
    setErrorMessage(''); // เคลียร์ข้อความแจ้งเตือน

    try {
      // ยิง API ไปที่ Backend Laravel
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // ห้ามลืมบรรทัดนี้เด็ดขาด
        },
        // ส่ง email และ password ไปให้ API
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // หากล็อกอินสำเร็จ: เก็บ Token ลงใน localStorage ของเบราว์เซอร์
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('เข้าสู่ระบบสำเร็จ!');
        
        // เช็ค Role เพื่อเปลี่ยนหน้า (ถ้าเป็น seller ไปหน้า seller, ถ้าเป็น buyer ไปหน้าแรก)
        if (data.user.role === 'seller') {
          router.push('/seller');
        } else {
          router.push('/');
        }
      } else {
        // หากล็อกอินไม่สำเร็จ (พาสเวิร์ดผิด, ไม่มีเมล)
        setErrorMessage(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white py-5 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" className="text-3xl font-bold text-[#1B4D3E] tracking-wider hover:opacity-90">พณาไพรสิน</a>
            <span className="text-2xl text-gray-800 font-medium md:text-2xl">เข้าสู่ระบบ</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="bg-[#1B4D3E] flex-grow flex items-center py-10">
        <div className="container mx-auto px-4 max-w-5xl flex justify-center md:justify-between items-center gap-8">
          
          {/* Left Image Section */}
          <div className="hidden md:block w-3/5 h-[480px]">
            <img 
              src="/image_289eb4.jpg" 
              alt="ของเก่าโบราณ พณาไพรสิน" 
              className="w-full h-full object-cover rounded-md shadow-2xl border-4 border-white/10"
            />
          </div>

          {/* Right Form Section */}
          <div className="w-full max-w-[400px] bg-white rounded-sm shadow-xl p-8">
            <h2 className="text-xl text-gray-900 font-bold mb-6">เข้าสู่ระบบ</h2>
            
            {/* แสดงข้อความ Error ถ้ามี */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm font-medium">
                {errorMessage}
              </div>
            )}
            
            {/* ผูกฟังก์ชัน handleLogin กับฟอร์ม */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                {/* เปลี่ยนเป็นช่องกรอก Email ให้ตรงกับ API Backend */}
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="อีเมล (Email)" 
                  required
                  className="w-full px-4 py-3 border border-gray-400 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="รหัสผ่าน (Password)" 
                  required
                  className="w-full px-4 py-3 border border-gray-400 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#1B4D3E] text-white py-3 rounded-sm font-bold hover:bg-[#143a2f] transition shadow-sm uppercase mt-2"
              >
                เข้าสู่ระบบ
              </button>

              <div className="flex justify-between items-center text-sm text-[#1B4D3E] mt-4 font-medium">
                <a href="#" className="hover:underline">ลืมรหัสผ่าน?</a>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-700 font-medium">
              เพิ่งเคยเข้ามาใน พณาไพรสิน ใช่หรือไม่? <a href="/signup" className="text-[#1B4D3E] font-bold hover:underline">สมัครใหม่</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-700 text-sm font-medium">
            © 2026 พณาไพรสิน (Panaprisin) - ของสะสมและของเก่าโบราณ. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}