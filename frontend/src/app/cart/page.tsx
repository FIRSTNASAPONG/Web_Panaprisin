"use client";

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  // ดึงฟังก์ชันมาใช้ให้หมด
  const { cart, removeFromCart, clearCart } = useCart();

  // คำนวณราคารวมทั้งหมดในตะกร้า
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 max-w-5xl flex-grow py-8">
        <h1 className="text-2xl font-bold text-[#1B4D3E] mb-6 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          ตะกร้าสินค้าของฉัน
        </h1>

        {cart.length === 0 ? (
          /* กรณีที่ยังไม่มีของในตะกร้า */
          <div className="bg-white rounded-sm shadow-sm p-12 flex flex-col items-center justify-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-300"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <p className="text-lg font-medium text-gray-700 mb-4">ตะกร้าของคุณยังว่างเปล่า</p>
            <a href="/" className="bg-[#1B4D3E] text-white px-8 py-2 rounded-sm font-medium hover:bg-[#143a2f] transition">
              ไปเลือกซื้อสินค้าเลย
            </a>
          </div>
        ) : (
          /* กรณีมีของในตะกร้า */
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* รายการสินค้า (ฝั่งซ้าย) */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-600 bg-gray-50">
                  <div className="col-span-6">สินค้า</div>
                  <div className="col-span-2 text-center">ราคาต่อชิ้น</div>
                  <div className="col-span-2 text-center">จำนวน</div>
                  <div className="col-span-2 text-right">ยอดรวม</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                      <div className="col-span-1 md:col-span-6 flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 shrink-0 border border-gray-200">
                          <img 
                            src={item.image ? `/${item.image}` : "https://placehold.co/400x400/1B4D3E/FFFFFF?text=Product"} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex flex-col justify-between py-1">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.id)} // ผูกฟังก์ชันลบ
                            className="text-xs text-red-500 font-medium text-left hover:underline w-max"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 text-sm text-gray-700 md:text-center hidden md:block">
                        ฿{item.price.toLocaleString()}
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                        <span className="text-sm text-gray-500 md:hidden">จำนวน:</span>
                        <div className="w-12 h-8 border border-gray-300 rounded-sm flex items-center justify-center text-sm font-medium bg-gray-50">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-2 text-right font-medium text-[#1B4D3E]">
                        <span className="text-sm text-gray-500 md:hidden mr-2">ยอดรวม:</span>
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* สรุปคำสั่งซื้อ (ฝั่งขวา) */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">สรุปคำสั่งซื้อ</h2>
                
                <div className="space-y-3 mb-6 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>ยอดรวมสินค้า ({cart.length} ชิ้น)</span>
                    <span className="font-medium text-gray-900">฿{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าจัดส่ง</span>
                    <span className="font-medium text-gray-900">ฟรี</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-900 font-medium">ยอดสุทธิ</span>
                    <span className="text-2xl font-bold text-[#1B4D3E]">฿{totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">รวมภาษีมูลค่าเพิ่มแล้ว</p>
                </div>

                <button 
                  onClick={() => {
                    alert('จำลองการสั่งซื้อสำเร็จ ขอบคุณครับ!');
                    clearCart(); // ล้างตะกร้าหลังกดจ่ายเงิน
                  }}
                  className="w-full bg-[#1B4D3E] text-white py-3 rounded-sm font-bold hover:bg-[#143a2f] shadow-sm transition uppercase text-sm"
                >
                  ดำเนินการชำระเงิน
                </button>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}