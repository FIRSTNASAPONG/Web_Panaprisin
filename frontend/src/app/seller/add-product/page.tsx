"use client";

import React from 'react';

export default function AddProductPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* Sidebar (แถบเมนูด้านซ้าย) */}
      <aside className="w-64 bg-[#1B4D3E] text-white hidden md:flex flex-col shadow-xl shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1B4D3E] font-bold text-xl">
            พ
          </div>
          <div>
            <h2 className="font-bold tracking-wide">พณาไพรสิน</h2>
            <p className="text-xs text-green-200">Seller Centre</p>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            <li>
              <a href="/seller" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                แดชบอร์ด
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/></svg>
                ร้านค้าของฉัน
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                สินค้าทั้งหมด
              </a>
            </li>
            {/* ไฮไลท์เมนูนี้ว่ากำลังใช้งานอยู่ */}
            <li>
              <a href="/seller/add-product" className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                เพิ่มสินค้าใหม่
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                คำสั่งซื้อ
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                การตั้งค่า
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">เพิ่มสินค้าใหม่</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                <img src="https://placehold.co/100x100/1B4D3E/FFFFFF?text=Admin" alt="Admin" />
              </div>
              <span className="text-sm font-medium text-gray-700">ผู้ดูแลระบบ</span>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Section 1: ข้อมูลพื้นฐาน */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">ข้อมูลพื้นฐาน</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="เช่น พระสมเด็จวัดระฆัง พิมพ์ใหญ่" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900"/>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900 bg-white">
                    <option value="">เลือกหมวดหมู่...</option>
                    <option value="1">พระเครื่อง</option>
                    <option value="2">รูปปั้นและทองเหลือง</option>
                    <option value="3">เฟอร์นิเจอร์ไม้เก่า</option>
                    <option value="4">เครื่องกระเบื้อง</option>
                    <option value="5">เหรียญกษาปณ์</option>
                    <option value="6">หนังสือเก่า</option>
                    <option value="7">เครื่องดนตรีโบราณ</option>
                    <option value="8">ของสะสมอื่นๆ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า <span className="text-red-500">*</span></label>
                  <textarea rows={5} placeholder="อธิบายจุดเด่น ตำหนิ ประวัติ หรือข้อมูลเพิ่มเติมของสินค้า..." className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900"></textarea>
                </div>
              </div>
            </div>

            {/* Section 2: รูปภาพ */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">รูปภาพสินค้า</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1B4D3E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <p className="text-gray-900 font-medium mb-1">คลิกเพื่ออัปโหลดรูปภาพ หรือลากไฟล์มาวาง</p>
                <p className="text-sm text-gray-500">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB (แนะนำอัตราส่วน 1:1)</p>
              </div>
            </div>

            {/* Section 3: ข้อมูลการขาย */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">ข้อมูลการขาย</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท) <span className="text-red-500">*</span></label>
                  <input type="number" placeholder="0.00" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คลัง (ชิ้น) <span className="text-red-500">*</span></label>
                  <input type="number" placeholder="1" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900"/>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 pb-10">
              <button className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition">
                ยกเลิก
              </button>
              <button className="px-6 py-2.5 bg-[#1B4D3E] text-white rounded-md font-bold hover:bg-[#143a2f] shadow-sm transition">
                บันทึกและเผยแพร่
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}