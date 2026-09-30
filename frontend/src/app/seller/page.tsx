"use client";

import React from 'react';

export default function SellerCentrePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* Sidebar (แถบเมนูด้านซ้าย) */}
      <aside className="w-64 bg-[#1B4D3E] text-white hidden md:flex flex-col shadow-xl">
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
              <a href="#" className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium">
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
            <li>
              <a href="/seller/add-product" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
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

        <div className="p-6 border-t border-white/10">
          <a href="/" className="flex items-center gap-3 text-green-200 hover:text-white transition text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            กลับสู่หน้าร้านค้า
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar for Seller */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">ภาพรวมร้านค้า (Dashboard)</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-[#1B4D3E] transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                <img src="https://placehold.co/100x100/1B4D3E/FFFFFF?text=Admin" alt="Admin" />
              </div>
              <span className="text-sm font-medium text-gray-700">ผู้ดูแลระบบ</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 text-[#1B4D3E] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">ยอดขายวันนี้</p>
                <h3 className="text-2xl font-bold text-gray-900">฿12,500</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">คำสั่งซื้อรอดำเนินการ</p>
                <h3 className="text-2xl font-bold text-gray-900">5</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">สินค้าทั้งหมด</p>
                <h3 className="text-2xl font-bold text-gray-900">124</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">สินค้าหมดสต็อก</p>
                <h3 className="text-2xl font-bold text-gray-900">2</h3>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">คำสั่งซื้อล่าสุด</h3>
              <a href="#" className="text-sm text-[#1B4D3E] font-medium hover:underline">ดูทั้งหมด</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="px-6 py-3 font-medium border-b border-gray-200">หมายเลขคำสั่งซื้อ</th>
                    <th className="px-6 py-3 font-medium border-b border-gray-200">สินค้า</th>
                    <th className="px-6 py-3 font-medium border-b border-gray-200">ยอดรวม</th>
                    <th className="px-6 py-3 font-medium border-b border-gray-200">สถานะ</th>
                    <th className="px-6 py-3 font-medium border-b border-gray-200">วันที่</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">#ORD-00125</td>
                    <td className="px-6 py-4">สิงห์ทองเหลืองโบราณ คู่</td>
                    <td className="px-6 py-4">฿8,500</td>
                    <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs font-medium">รอจัดส่ง</span></td>
                    <td className="px-6 py-4">01 ต.ค. 2026</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">#ORD-00124</td>
                    <td className="px-6 py-4">เหรียญ ร.5 รัชมังคลาภิเศก</td>
                    <td className="px-6 py-4">฿12,000</td>
                    <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-xs font-medium">รอจัดส่ง</span></td>
                    <td className="px-6 py-4">30 ก.ย. 2026</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">#ORD-00123</td>
                    <td className="px-6 py-4">ตู้ไม้สักแกะสลัก ลายไทย</td>
                    <td className="px-6 py-4">฿25,000</td>
                    <td className="px-6 py-4"><span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs font-medium">จัดส่งแล้ว</span></td>
                    <td className="px-6 py-4">28 ก.ย. 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}