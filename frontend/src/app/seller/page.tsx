"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerCentrePage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('ผู้ดูแลระบบ');
  const [loading, setLoading] = useState(true);

  // 🟢 State สำหรับเก็บข้อมูลสถิติจาก Backend
  const [stats, setStats] = useState({
    todaySales: 0,
    pendingOrders: 0,
    totalProducts: 0,
    outOfStockProducts: 0
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    // 🔴 ปิดระบบเช็คสิทธิ์ชั่วคราว เพื่อให้ทำ UI ต่อได้
    setAdminName('สมชาย (Dev Mode)'); 
    fetchDashboardData();
  }, [router]);

  // 🟢 ฟังก์ชันดึงข้อมูลสรุปและคำสั่งซื้อล่าสุดจาก Backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. ดึงข้อมูลสถิติ (ถ้า Backend มี API แยกสำหรับ Dashboard ก็ใช้ได้เลย แต่ตอนนี้ผมจำลองจากการดึงข้อมูลรวมมาก่อน)
      const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'no-store' });
      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, { cache: 'no-store' });

      if (productsRes.ok && ordersRes.ok) {
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        // จัดการรูปแบบข้อมูลที่ได้มา
        const productsList = Array.isArray(productsData) ? productsData : (productsData.data || []);
        const ordersList = Array.isArray(ordersData) ? ordersData : (ordersData.data || []);

        // คำนวณสถิติ
        const totalProds = productsList.length;
        const outOfStock = productsList.filter((p: any) => p.stock <= 0).length;
        const pendingOrds = ordersList.filter((o: any) => o.status === 'pending').length;
        
        // คำนวณยอดขายวันนี้ (ตัวอย่างแบบง่าย)
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySalesAmount = ordersList
          .filter((o: any) => o.created_at && o.created_at.startsWith(todayStr) && o.status !== 'cancelled')
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

        setStats({
          todaySales: todaySalesAmount,
          pendingOrders: pendingOrds,
          totalProducts: totalProds,
          outOfStockProducts: outOfStock
        });

        // ดึงแค่ 5 ออเดอร์ล่าสุดมาโชว์
        setRecentOrders(ordersList.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <a href="/seller" className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium">
                แดชบอร์ด
              </a>
            </li>
            {/* 🟢 ใส่ลิงก์พาไปหน้าจัดการสินค้าที่เราเพิ่งทำ */}
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
            {/* 🟢 ใส่ลิงก์พาไปหน้าออเดอร์ที่เราเพิ่งทำ */}
            <li>
              <a href="/seller/orders" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
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
        
        {/* Top Navbar for Seller */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">ภาพรวมร้านค้า (Dashboard)</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
              <div className="w-8 h-8 bg-[#1B4D3E] text-white flex items-center justify-center rounded-full font-bold text-sm">
                ส
              </div>
              <span className="text-sm font-medium text-gray-700">{adminName}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {loading ? (
             <div className="text-center p-20 text-gray-500 font-bold">กำลังโหลดข้อมูลแดชบอร์ด...</div>
          ) : (
            <>
              {/* Stats Cards (🟢 เอา State ที่คำนวณมาใส่แทนเลข 0) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-14 h-14 bg-green-100 text-[#1B4D3E] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">ยอดขายวันนี้</p>
                    <h3 className="text-2xl font-bold text-[#1B4D3E]">฿{stats.todaySales.toLocaleString()}</h3>
                  </div>
                </div>
                
                <div 
                  onClick={() => router.push('/seller/orders')}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">คำสั่งซื้อรอตรวจสอบสลิป</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
                  </div>
                </div>

                <div 
                  onClick={() => router.push('/seller/products')}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-purple-200 transition"
                >
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">สินค้าทั้งหมดในร้าน</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">สินค้าหมดสต็อก</p>
                    <h3 className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</h3>
                  </div>
                </div>
              </div>

              {/* 🟢 Recent Orders Table (ดึงข้อมูลจริงมาโชว์แบบย่อ) */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">คำสั่งซื้อล่าสุด</h3>
                  <button onClick={() => router.push('/seller/orders')} className="text-sm font-bold text-[#1B4D3E] hover:underline">
                    ดูทั้งหมด →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm">
                        <th className="px-6 py-3 font-bold border-b border-gray-200">รหัสคำสั่งซื้อ</th>
                        <th className="px-6 py-3 font-bold border-b border-gray-200">ชื่อลูกค้า</th>
                        <th className="px-6 py-3 font-bold border-b border-gray-200 text-right">ยอดรวม</th>
                        <th className="px-6 py-3 font-bold border-b border-gray-200 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">ยังไม่มีคำสั่งซื้อล่าสุด</td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer" onClick={() => router.push('/seller/orders')}>
                            <td className="px-6 py-4 font-mono font-bold text-[#1B4D3E]">#{order.id}</td>
                            <td className="px-6 py-4 font-medium">{order.customer_name || 'ไม่ระบุ'}</td>
                            <td className="px-6 py-4 font-bold text-right text-gray-900">฿{(order.total_amount || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                              {order.status === 'pending' ? (
                                <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-sm">รอโอนเงิน</span>
                              ) : order.status === 'processing' ? (
                                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-sm">เตรียมจัดส่ง</span>
                              ) : (
                                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-sm">จัดส่งแล้ว</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}