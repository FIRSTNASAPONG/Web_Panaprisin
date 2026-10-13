"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('ผู้ดูแลระบบ');

  // สำหรับ Modal ดูรายละเอียดออเดอร์
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // ข้อมูลจำลองเผื่อ Backend ยังไม่เสร็จ
  const MOCK_ORDERS = [
    {
      id: 1001,
      customer_name: "สมชาย ใจดี",
      total_amount: 15000,
      status: "pending", // pending, processing, shipped, cancelled
      slip_image: null,
      created_at: "2026-10-13T10:30:00Z",
      items: [
        { name: "ตู้ไม้สักโบราณ อายุ 50 ปี", quantity: 1, price: 15000 }
      ]
    },
    {
      id: 1002,
      customer_name: "สมหญิง รักดี",
      total_amount: 2500,
      status: "processing", 
      slip_image: "slip_mock.jpg",
      created_at: "2026-10-12T14:20:00Z",
      items: [
        { name: "เหรียญกษาปณ์ รัชกาลที่ 5", quantity: 1, price: 2500 }
      ]
    }
  ];

  useEffect(() => {
    // 🔴 ปิดระบบเช็คสิทธิ์ชั่วคราว เพื่อให้เทสต์ง่าย
    setAdminName('สมชาย (Dev Mode)');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        // ปรับให้เข้ากับโครงสร้างที่ Backend ส่งมา
        setOrders(data.data || data || MOCK_ORDERS);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแปลสถานะเป็นภาษาไทยและกำหนดสี
  const getStatusDisplay = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">รอตรวจสอบโอนเงิน</span>;
      case 'processing': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">กำลังเตรียมจัดส่ง</span>;
      case 'shipped': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">จัดส่งแล้ว</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">ยกเลิก</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status || 'ไม่ทราบสถานะ'}</span>;
    }
  };

  // ฟังก์ชันอัปเดตสถานะออเดอร์
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if (!confirm('ยืนยันการเปลี่ยนสถานะคำสั่งซื้อ?')) return;
    
    setStatusUpdateLoading(true);
    try {
      // 🟢 API อัปเดตสถานะ (ต้องตรงกับที่ Backend เตรียมไว้)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PUT', // หรือ PATCH
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert('อัปเดตสถานะสำเร็จ!');
        // อัปเดตข้อมูลใน State ทันทีโดยไม่ต้องโหลดใหม่
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        setIsModalOpen(false);
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (error) {
      console.error('Update status error:', error);
      
      // 🔴 Dev Mode Fallback: แกล้งทำเป็นว่าอัปเดตสำเร็จ
      alert('[Dev Mode] จำลองการอัปเดตสถานะสำเร็จ');
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      setIsModalOpen(false);
      
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* Sidebar (แถบเมนูด้านซ้าย) */}
      <aside className="w-64 bg-[#1B4D3E] text-white hidden md:flex flex-col shadow-xl shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1B4D3E] font-bold text-xl">พ</div>
          <div>
            <h2 className="font-bold tracking-wide">พณาไพรสิน</h2>
            <p className="text-xs text-green-200">Seller Centre</p>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            <li>
              <a href="/seller" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                แดชบอร์ด
              </a>
            </li>
            {/* 🔴 เพิ่มลิงก์หน้า จัดการสินค้า ที่เดี๋ยวเราจะทำต่อ */}
            <li>
              <a href="/seller/products" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                จัดการสินค้าทั้งหมด
              </a>
            </li>
            <li>
              <a href="/seller/add-product" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                เพิ่มสินค้าใหม่
              </a>
            </li>
            <li>
              <a href="/seller/orders" className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium">
                จัดการคำสั่งซื้อ
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="p-6 border-t border-white/10">
          <a href="/" className="flex items-center gap-3 text-green-200 hover:text-white transition text-sm">
            กลับสู่หน้าร้านค้า
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200 z-10">
          <h1 className="text-xl font-bold text-gray-800">จัดการคำสั่งซื้อ</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
              <div className="w-8 h-8 bg-[#1B4D3E] text-white flex items-center justify-center rounded-full font-bold text-sm">ส</div>
              <span className="text-sm font-medium text-gray-700">{adminName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">รายการคำสั่งซื้อทั้งหมด</h2>
            </div>

            {loading ? (
              <div className="p-20 text-center text-gray-500 font-bold">กำลังโหลดข้อมูลคำสั่งซื้อ...</div>
            ) : orders.length === 0 ? (
              <div className="p-20 text-center text-gray-500 font-bold">ยังไม่มีคำสั่งซื้อในขณะนี้</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                      <th className="px-6 py-4 font-bold">รหัสคำสั่งซื้อ</th>
                      <th className="px-6 py-4 font-bold">วันที่สั่งซื้อ</th>
                      <th className="px-6 py-4 font-bold">ชื่อลูกค้า</th>
                      <th className="px-6 py-4 font-bold text-right">ยอดรวม (บาท)</th>
                      <th className="px-6 py-4 font-bold text-center">สถานะ</th>
                      <th className="px-6 py-4 font-bold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                    {orders.map((order) => {
                      // จัดรูปแบบวันที่ (ถ้ามี)
                      const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : '-';
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-mono font-bold text-[#1B4D3E]">#{order.id}</td>
                          <td className="px-6 py-4">{dateStr}</td>
                          <td className="px-6 py-4 font-medium">{order.customer_name || 'ไม่ระบุชื่อ'}</td>
                          <td className="px-6 py-4 font-bold text-right text-gray-900">{(order.total_amount || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            {getStatusDisplay(order.status)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-bold border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-sm transition"
                            >
                              ตรวจสอบ
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal ดูรายละเอียดออเดอร์ */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                รายละเอียดคำสั่งซื้อ <span className="text-[#1B4D3E]">#{selectedOrder.id}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* ข้อมูลลูกค้า & สถานะ */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">ชื่อลูกค้า</p>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.customer_name || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">สถานะปัจจุบัน</p>
                  <div>{getStatusDisplay(selectedOrder.status)}</div>
                </div>
              </div>

              {/* รายการสินค้า */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">รายการสินค้า</h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-700">
                          {item.name} <span className="text-gray-400 text-xs">x{item.quantity}</span>
                        </span>
                        <span className="font-bold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">ไม่มีข้อมูลรายการสินค้า</p>
                  )}
                  <div className="flex justify-between items-center text-base pt-2">
                    <span className="font-bold text-gray-900">ยอดรวมทั้งสิ้น</span>
                    <span className="font-bold text-xl text-[#1B4D3E]">฿{(selectedOrder.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* รูปสลิปโอนเงิน */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">หลักฐานการโอนเงิน (สลิป)</h4>
                {selectedOrder.slip_image ? (
                  <div className="border border-gray-300 rounded-md overflow-hidden bg-gray-100 p-2 max-w-sm mx-auto">
                    <img 
                      src={`http://localhost:8080/storage/${selectedOrder.slip_image}`} 
                      alt="Slip" 
                      className="w-full h-auto object-contain max-h-[400px]"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x600/E2E8F0/A0AEC0?text=Slip+Image+Not+Found' }}
                    />
                  </div>
                ) : (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200 text-center text-sm font-bold">
                    ยังไม่มีการแนบสลิปโอนเงิน
                  </div>
                )}
              </div>
            </div>

            {/* ส่วนปุ่มเปลี่ยนสถานะ */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-3 justify-end rounded-b-lg">
              <button 
                disabled={statusUpdateLoading || selectedOrder.status === 'processing'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                สลิปถูกต้อง (เตรียมจัดส่ง)
              </button>
              
              <button 
                disabled={statusUpdateLoading || selectedOrder.status === 'shipped'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-bold text-sm hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                จัดส่งเรียบร้อยแล้ว
              </button>

              <button 
                disabled={statusUpdateLoading || selectedOrder.status === 'cancelled'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-bold text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                ยกเลิกคำสั่งซื้อ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}