"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  // สร้าง State สำหรับเก็บค่าจากฟอร์ม
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('buyer'); // ค่าเริ่มต้นเป็น buyer
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  // ฟังก์ชันจัดการเมื่อกดปุ่ม "สมัครสมาชิก"
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // เช็ครหัสผ่านให้ตรงกัน
    if (password !== passwordConfirmation) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          password_confirmation: passwordConfirmation, 
          role 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // หากสมัครสำเร็จ: เก็บ Token ลงใน localStorage ของเบราว์เซอร์
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('สมัครสมาชิกสำเร็จ!');
        
        // เช็ค Role เพื่อพาไปหน้าแรก หรือหน้าผู้ขาย
        if (role === 'seller') {
          router.push('/seller');
        } else {
          router.push('/');
        }
      } else {
        // หากสมัครไม่สำเร็จ (อีเมลซ้ำ, พาสเวิร์ดสั้นไป)
        setErrorMessage(data.message || 'ข้อมูลไม่ถูกต้อง หรืออีเมลนี้ถูกใช้งานแล้ว');
      }
    } catch (error) {
      console.error('Signup error:', error);
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
            <span className="text-2xl text-gray-800 font-medium md:text-2xl">สมัครใหม่</span>
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
            <h2 className="text-xl text-gray-900 font-bold mb-6">สมัครสมาชิก</h2>
            
            {/* แสดงข้อความ Error ถ้ามี */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm font-medium">
                {errorMessage}
              </div>
            )}

            {/* ผูกฟังก์ชัน handleSignup กับฟอร์ม */}
            <form className="space-y-4" onSubmit={handleSignup}>
              <div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อผู้ใช้ (Name)" 
                  required
                  className="w-full px-4 py-3 border border-gray-400 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>
              <div>
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
                  placeholder="รหัสผ่าน (Password - ขั้นต่ำ 8 ตัว)" 
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-400 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="ยืนยันรหัสผ่าน (Confirm Password)" 
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-400 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>

              {/* ส่วนเลือกประเภทผู้ใช้งาน (Buyer / Seller) */}
              <div className="flex items-center space-x-4 py-2">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    value="buyer" 
                    checked={role === 'buyer'}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-radio text-[#1B4D3E] focus:ring-[#1B4D3E]"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">ผู้ซื้อทั่วไป</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    value="seller" 
                    checked={role === 'seller'}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-radio text-[#1B4D3E] focus:ring-[#1B4D3E]"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">ผู้ขายสินค้า</span>
                </label>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#1B4D3E] text-white py-3 rounded-sm font-bold hover:bg-[#143a2f] transition shadow-sm uppercase mt-2"
              >
                สมัครสมาชิก
              </button>
            </form>

            <div className="text-center text-xs text-gray-700 mt-6 mb-4 px-4 font-medium leading-relaxed">
              โดยการสมัครสมาชิก คุณได้อ่านและยอมรับ <br/><a href="#" className="text-[#1B4D3E] font-bold hover:underline">เงื่อนไขการให้บริการ</a> และ <a href="#" className="text-[#1B4D3E] font-bold hover:underline">นโยบายความเป็นส่วนตัว</a> ของ พณาไพรสิน
            </div>

            <div className="text-center text-sm text-gray-700 font-medium">
              หากมีบัญชีผู้ใช้แล้ว คุณสามารถ <a href="/login" className="text-[#1B4D3E] font-bold hover:underline">เข้าสู่ระบบ</a>
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