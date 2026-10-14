"use client";

import type { Order, OrderListResponse } from "@/types/api";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('ผู้ขาย');
  const [userRole, setUserRole] = useState<string>('');

  // สำหรับ Modal ดูรายละเอียดออเดอร์
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const fetchOrders = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const data: OrderListResponse = await res.json();
        // รองรับ Laravel paginate(20) ที่ข้อมูลจะอยู่ใน data.data
        const orderList = Array.isArray(data) ? data : (data.data || []);
        setOrders(orderList);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const token = localStorage.getItem('token');

    // 🟢 เช็คสิทธิ์ตาม OrderController.php (อนุญาตเฉพาะ seller และ admin)
    if (!token || !user || (user.role !== 'seller' && user.role !== 'admin')) {
      alert('เฉพาะผู้ขายหรือผู้ดูแลระบบเท่านั้นที่เข้าถึงหน้านี้ได้');
      router.push('/');
      return;
    }

    setAdminName(user.name || 'ผู้ขาย');
    setUserRole(user.role);
    fetchOrders(token);
  }, [router, fetchOrders]);

  // แปลสถานะให้ตรงกับ OrderController (pending, paid, shipped, completed, cancelled)
  const getStatusDisplay = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">รอชำระเงิน</span>;
      case 'paid':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">ชำระเงินแล้ว</span>;
      case 'shipped':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">จัดส่งแล้ว</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">สำเร็จ</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">ยกเลิก</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">{status || 'ไม่ทราบสถานะ'}</span>;
    }
  };

  // 🟢 อัปเดตสถานะคำสั่งซื้อ (ส่งคีย์ order_status ตามที่ OrderController กำหนด)
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm(`ยืนยันการเปลี่ยนสถานะคำสั่งซื้อเป็น "${newStatus}" ?`)) return;

    setStatusUpdateLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ order_status: newStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert('อัปเดตสถานะคำสั่งซื้อสำเร็จ!');
        await fetchOrders(token);
        setIsModalOpen(false);
      } else {
        alert(data.message || 'ไม่สามารถอัปเดตสถานะได้ (เฉพาะ Admin เท่านั้นที่เปลี่ยนสถานะได้)');
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
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
              <Link href="/seller" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                แดชบอร์ด
              </Link>
            </li>
            <li>
              <Link href="/seller/products" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                จัดการสินค้าทั้งหมด
              </Link>
            </li>
            <li>
              <Link href="/seller/add-product" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                เพิ่มสินค้าใหม่
              </Link>
            </li>
            <li>
              <Link href="/seller/orders" className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium">
                จัดการคำสั่งซื้อ
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-6 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 text-green-200 hover:text-white transition text-sm">
            กลับสู่หน้าร้านค้า
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200 z-10">
          <h1 className="text-xl font-bold text-gray-800">จัดการคำสั่งซื้อ</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
              <div className="w-8 h-8 bg-[#1B4D3E] text-white flex items-center justify-center rounded-full font-bold text-sm">
                {adminName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">{adminName} ({userRole})</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">รายการคำสั่งซื้อทั้งหมด ({orders.length} รายการ)</h2>
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
                      <th className="px-6 py-4 font-bold">ลูกค้า / ที่อยู่</th>
                      <th className="px-6 py-4 font-bold text-right">ยอดรวม (บาท)</th>
                      <th className="px-6 py-4 font-bold text-center">สถานะ</th>
                      <th className="px-6 py-4 font-bold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                    {orders.map((order) => {
                      const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : '-';
                      const currentStatus = order.status || order.order_status || 'pending';
                      const customerDisplay = order.user?.name || order.shipping_address || `คำสั่งซื้อ #${order.id}`;

                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-mono font-bold text-[#1B4D3E]">#{order.id}</td>
                          <td className="px-6 py-4">{dateStr}</td>
                          <td className="px-6 py-4 font-medium max-w-xs truncate">{customerDisplay}</td>
                          <td className="px-6 py-4 font-bold text-right text-gray-900">
                            ฿{Number(order.total_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center">{getStatusDisplay(currentStatus)}</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-bold border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-sm transition"
                            >
                              ดูรายละเอียด
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
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition font-bold text-xl">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">ข้อมูลจัดส่ง</p>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.shipping_address || selectedOrder.user?.name || 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">สถานะปัจจุบัน</p>
                  <div>{getStatusDisplay(selectedOrder.status || selectedOrder.order_status)}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">รายการสินค้า</h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => {
                      const itemName = item.name || item.product?.name || `รหัสสินค้า #${item.product_id}`;
                      const itemPrice = Number(item.price ?? item.unit_price ?? 0);
                      const itemSubtotal = Number(item.subtotal ?? itemPrice * item.quantity);

                      return (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-700 font-medium">
                            {itemName} <span className="text-gray-500 text-xs font-bold">x{item.quantity}</span>
                          </span>
                          <span className="font-bold text-gray-900">฿{itemSubtotal.toLocaleString()}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">ไม่มีข้อมูลรายการสินค้า</p>
                  )}
                  <div className="flex justify-between items-center text-base pt-2">
                    <span className="font-bold text-gray-900">ยอดรวมทั้งสิ้น</span>
                    <span className="font-bold text-xl text-[#1B4D3E]">
                      ฿{Number(selectedOrder.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มเปลี่ยนสถานะ (แสดงเฉพาะ Admin ตามที่ Backend กำหนด) */}
            {userRole === 'admin' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-2 justify-end rounded-b-lg">
                <button
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'paid')}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md font-bold text-xs hover:bg-blue-700 transition disabled:opacity-50"
                >
                  ชำระเงินแล้ว (paid)
                </button>
                <button
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                  className="px-3 py-2 bg-purple-600 text-white rounded-md font-bold text-xs hover:bg-purple-700 transition disabled:opacity-50"
                >
                  จัดส่งแล้ว (shipped)
                </button>
                <button
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                  className="px-3 py-2 bg-green-600 text-white rounded-md font-bold text-xs hover:bg-green-700 transition disabled:opacity-50"
                >
                  สำเร็จ (completed)
                </button>
                <button
                  disabled={statusUpdateLoading}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  className="px-3 py-2 bg-red-600 text-white rounded-md font-bold text-xs hover:bg-red-700 transition disabled:opacity-50 ml-auto"
                >
                  ยกเลิก (cancelled)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}