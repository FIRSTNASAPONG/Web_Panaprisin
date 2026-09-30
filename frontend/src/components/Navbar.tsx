"use client";

import React from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount } = useCart();

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#143a2f] text-white text-sm py-1">
        <div className="container mx-auto px-4 flex justify-between items-center max-w-6xl">
          <div className="flex space-x-4">
            <a href="/seller" className="hover:text-gray-300">Seller Centre</a>
            <span className="border-l border-gray-500"></span>
            <a href="/seller" className="hover:text-gray-300">เริ่มต้นขายสินค้า</a>
            <span className="border-l border-gray-500"></span>
            <div className="flex items-center space-x-2 hidden sm:flex">
              <span>ติดตามเราบน</span>
              <a href="https://www.facebook.com/panaprisin?locale=th_TH" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>
          <div className="flex space-x-4 items-center">
            <a href="#" className="hover:text-gray-300 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              ไทย
            </a>
            <a href="/signup" className="hover:text-gray-300 font-bold">สมัครใหม่</a>
            <span className="border-l border-gray-500 h-3"></span>
            <a href="/login" className="hover:text-gray-300 font-bold">เข้าสู่ระบบ</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-[#1B4D3E] text-white pt-6 pb-4 sticky top-0 z-50 shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between gap-8">
            <a href="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer hover:opacity-90 transition">
              <h1 className="text-3xl font-bold tracking-wider">พณาไพรสิน</h1>
              <span className="border-l-2 border-white/30 h-6 hidden md:block"></span>
              <span className="text-sm font-medium text-green-200 hidden md:block">ของสะสม & ของเก่าโบราณ</span>
            </a>

            <div className="flex-grow max-w-xl">
              <div className="flex bg-white rounded-sm overflow-hidden p-1">
                <input type="text" placeholder="ค้นหาสินค้า และร้านค้า..." className="flex-grow px-4 py-1.5 text-gray-800 outline-none text-sm" />
                <button className="bg-[#1B4D3E] px-6 py-1.5 rounded-sm hover:bg-[#143a2f] transition text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </button>
              </div>
            </div>

            {/* ส่วนไอคอนตะกร้าพร้อมตัวเลข */}
            <a href="/cart" className="flex-shrink-0 mr-4 cursor-pointer hover:opacity-80 transition relative block">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1B4D3E]">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}