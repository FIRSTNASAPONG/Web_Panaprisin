"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios'; // นำเข้า axios ที่เราตั้งค่าไว้

export default function SignupPage() {
  // แยก name เป็น firstName และ lastName
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('buyer'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (password !== passwordConfirmation) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    
    setIsLoading(true);

    try {
      // 🟢 จับชื่อและนามสกุลมาต่อกัน คั่นด้วยช่องว่าง เพื่อส่งเป็นตัวแปร name ตัวเดียวตามที่ Backend ต้องการ
      const fullName = `${firstName} ${lastName}`.trim();

      const res = await api.post('/register', { 
        name: fullName, 
        email, 
        password, 
        password_confirmation: passwordConfirmation, 
        role 
      });
      
      const data = res.data;
      
      // เก็บ Token ของจริงไว้ใช้งาน
      localStorage.setItem('token', data.access_token || data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      alert('สมัครสมาชิกสำเร็จ!');
      
      if (role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/');
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      // ดึงข้อความ Error แบบละเอียดจาก Backend (ถ้ามี) มาแสดง
      const backendError = error.response?.data?.message || 'ข้อมูลไม่ถูกต้อง หรืออีเมลนี้ถูกใช้งานแล้ว';
      setErrorMessage(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      <header className="bg-white py-5 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" className="text-3xl font-bold text-[#1B4D3E] tracking-wider hover:opacity-90">พณาไพรสิน</a>
            <span className="text-2xl text-gray-800 font-medium md:text-2xl">สมัครใหม่</span>
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
            <h2 className="text-xl text-gray-900 font-bold mb-6">สมัครสมาชิก</h2>
            
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-sm mb-6 text-sm font-medium shadow-sm">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ชื่อ (First Name)" 
                  required
                  className="w-1/2 px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-400 font-medium transition"
                />
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="นามสกุล (Last Name)" 
                  required
                  className="w-1/2 px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-400 font-medium transition"
                />
              </div>
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
                  placeholder="รหัสผ่าน (Password - ขั้นต่ำ 8 ตัว)" 
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-400 font-medium transition"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-400 font-medium transition"
                />
              </div>

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
                disabled={isLoading}
                className={`w-full py-3 rounded-sm font-bold shadow-sm uppercase mt-2 transition ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-100 cursor-not-allowed' 
                    : 'bg-[#1B4D3E] text-white hover:bg-[#143a2f]'
                }`}
              >
                {isLoading ? 'กำลังบันทึกข้อมูล...' : 'สมัครสมาชิก'}
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

      <footer className="bg-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-700 text-sm font-medium">
            © 2026 พณาไพรสิน (Panaprisin) - ของสะสมและของเก่าโบราณ. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}