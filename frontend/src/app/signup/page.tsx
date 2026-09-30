"use client";

import React from 'react';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white py-5 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" className="text-3xl font-bold text-[#1B4D3E] tracking-wider hover:opacity-90">พณาไพรสิน</a>
            <span className="text-2xl text-gray-800 font-medium text-xl md:text-2xl">สมัครใหม่</span>
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
            
            <form className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="ชื่อผู้ใช้ (Username)" 
                  className="w-full px-4 py-3 border border-gray-400 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="รหัสผ่าน (Password)" 
                  className="w-full px-4 py-3 border border-gray-400 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="ยืนยันรหัสผ่าน (Confirm Password)" 
                  className="w-full px-4 py-3 border border-gray-400 rounded-sm focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>
              
              <button 
                type="button"
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