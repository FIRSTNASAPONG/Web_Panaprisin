"use client";

import Image from "next/image";

import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  
  // สมมติว่าเราดึงข้อมูลออเดอร์ล่าสุดมาจาก State หรือ LocalStorage
  // (ในระบบจริงจะดึงผ่าน API ด้วย Order ID)
  const [orderId] = useState('PN-20261009-001');
  const [grandTotal] = useState(1500000);
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f6f6] font-sans flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 max-w-4xl flex-grow py-10 pb-20">
        
        {/* ===================== ส่วนหัว: สั่งซื้อสำเร็จ ===================== */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-10 text-center mb-6">
          <div className="w-16 h-16 bg-[#eef2f0] border-2 border-[#1B4D3E] text-[#1B4D3E] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1B4D3E] mb-2">สั่งซื้อสำเร็จ</h1>
          <p className="text-gray-600 font-medium mb-4">ขอบคุณที่เลือกซื้อสินค้าจาก พณาไพรสิน</p>
          <div className="text-xl font-bold text-gray-900 mb-2">หมายเลขคำสั่งซื้อ {orderId}</div>
          <p className="text-sm text-gray-500 font-medium">9 ตุลาคม 2026 • สถานะ: <span className="text-yellow-600">รอชำระเงิน</span></p>
        </div>

        <div className="bg-[#eef2f0] text-gray-600 text-xs py-2 px-4 rounded-md mb-6">
          ข้อมูลส่วนบุคคลและคำสั่งซื้อเป็นข้อมูลตัวอย่าง
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* ===================== ฝั่งซ้าย: รายละเอียดคำสั่งซื้อ ===================== */}
          <div className="w-full md:w-1/2 space-y-6">
            
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-extrabold text-gray-900 mb-6">รายละเอียดคำสั่งซื้อ</h2>
              
              <div className="flex gap-4 pb-6 border-b border-gray-100 mb-6">
                <div className="w-20 h-24 bg-[#1B4D3E] text-white flex items-center justify-center shrink-0 font-medium text-sm rounded-sm">
                  Amulet 1
                </div>
                <div className="flex-1 flex flex-col pt-1">
                  <h3 className="font-bold text-sm text-gray-900">พระสมเด็จวัดระฆัง พิมพ์ใหญ่</h3>
                  <p className="text-xs text-gray-500 mt-1">พระเครื่อง • พณาไพรสิน</p>
                  <p className="text-sm font-bold text-[#1B4D3E] mt-1">฿1,500,000</p>
                  <p className="text-xs text-gray-500 mt-auto">จำนวน 1 ชิ้น</p>
                </div>
              </div>

              <div className="space-y-3 text-sm font-medium text-gray-600 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า (1 ชิ้น)</span>
                  <span className="font-bold text-gray-800">฿1,500,000</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-bold text-gray-800">ฟรี</span>
                </div>
                <div className="flex justify-between">
                  <span>ส่วนลด</span>
                  <span className="font-bold text-gray-800">฿0</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="font-extrabold text-gray-900 text-lg">ยอดสุทธิ</span>
                <span className="text-2xl font-extrabold text-[#1B4D3E] tracking-tight">฿{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* กล่องขั้นตอนถัดไป */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">ขั้นตอนถัดไป</h2>
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700 font-medium mb-6">
                <li>ตรวจสอบรายละเอียดการชำระเงินในหน้าคำสั่งซื้อของฉัน</li>
                <li>โอนเงินและแจ้งหลักฐานการชำระเงินให้ร้านค้าตรวจสอบ</li>
                <li>หลังยืนยันการชำระเงิน ร้านค้าจะจัดเตรียมสินค้าและแจ้งเลขพัสดุในคำสั่งซื้อของคุณ</li>
              </ol>
              <button 
                onClick={() => alert('จำลองพาวาร์ปไปหน้า โปรไฟล์ -> ประวัติคำสั่งซื้อ')}
                className="w-full bg-[#1B4D3E] text-white py-3 rounded-md font-bold hover:bg-[#143a2f] transition shadow-sm text-sm"
              >
                ดูคำสั่งซื้อของฉัน
              </button>
            </div>

            <button onClick={() => router.push('/')} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-md hover:bg-gray-50 transition shadow-sm text-sm">
              เลือกซื้อสินค้าต่อ
            </button>
          </div>

          {/* ===================== ฝั่งขวา: ที่อยู่ & ชำระเงิน (QR Code) ===================== */}
          <div className="w-full md:w-1/2 space-y-6">
            
            {/* ที่อยู่จัดส่ง */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">ที่อยู่จัดส่ง</h2>
              <h3 className="font-bold text-gray-800 text-sm mb-1">สมชาย ใจดี</h3>
              <p className="text-sm text-gray-600 mb-4">080-000-0000</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                99/9 หมู่ 2 ตำบลหนองแก๋ว<br />อำเภอหางดง จังหวัดเชียงใหม่ 50230
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700">
                <div className="w-2 h-2 bg-[#1B4D3E] rounded-full"></div>
                จัดส่งมาตรฐาน • ฟรี
              </div>
            </div>

            {/* กล่องชำระเงิน (คลิกเพื่อเปิด QR Code) */}
            <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">การชำระเงิน</h2>
              
              <div className="mb-4">
                <span className="block font-bold text-gray-800 text-sm mb-1">โอนเงินผ่านธนาคาร</span>
                <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">รอชำระเงิน</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">แจ้งรายละเอียดการชำระคำสั่งซื้อที่ somchai@example.com</p>

              {/* 🟢 ปุ่มกดแสดง QR Code 🟢 */}
              {!showQR ? (
                <button 
                  onClick={() => setShowQR(true)}
                  className="w-full py-3 border-2 border-[#1B4D3E] text-[#1B4D3E] font-bold rounded-md hover:bg-green-50 transition text-sm flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="16" y="16" rx="1"/><path d="M3 16h5v5H3z"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>
                  แสดง QR Code เพื่อชำระเงิน
                </button>
              ) : (
                <div className="mt-4 p-6 border-2 border-[#1B4D3E] rounded-lg bg-green-50/30 flex flex-col items-center animate-in fade-in duration-300">
                  <p className="text-[#1B4D3E] font-bold text-sm mb-4">สแกนเพื่อชำระเงินผ่าน PromptPay</p>
                  
                  {/* ภาพ QR Code (ดึงมาจากเน็ต หรือใช้รูปในโฟลเดอร์ public ก็ได้) */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                     <Image unoptimized loading="eager" width={160} height={160}
                       src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                       alt="QR Code PromptPay" 
                       className="w-40 h-40 opacity-80 mix-blend-multiply" 
                     />
                  </div>
                  
                  <p className="text-xl font-extrabold text-[#1B4D3E] tracking-tight">฿{grandTotal.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">ชื่อบัญชี: บจก. พณาไพรสิน</p>
                  
                  <button 
                    onClick={() => alert('ระบบอัปโหลดสลิปจะอยู่ในหน้า "คำสั่งซื้อของฉัน" ครับ')}
                    className="mt-6 w-full py-2.5 bg-[#1B4D3E] text-white font-bold rounded-md hover:bg-[#143a2f] transition text-sm shadow-sm"
                  >
                    แจ้งชำระเงิน (อัปโหลดสลิป)
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}