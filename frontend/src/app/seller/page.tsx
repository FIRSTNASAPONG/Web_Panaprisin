"use client";

import type { Order, OrderListResponse, Product, ProductListResponse, User } from "@/types/api";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function SellerCentrePage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('ผู้ขาย');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    todaySales: 0,
    pendingOrders: 0,
    totalProducts: 0,
    outOfStockProducts: 0
  });

  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const fetchDashboardData = useCallback(async (token: string, currentUser: User) => {
    setLoading(true); setError('');
    try {
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const [productsRes, ordersRes, reportRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/me/products`, { headers, cache: 'no-store' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/seller/orders`, { headers, cache: 'no-store' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/seller/reports/sales`, { headers, cache: 'no-store' })
      ]);

      let myProducts: Product[] = [];
      let myOrders: Order[] = [];

      if (productsRes.ok) {
        const productsData: ProductListResponse = await productsRes.json();
        const allProducts = Array.isArray(productsData) ? productsData : (productsData.data || []);
        // แสดงเฉพาะสินค้าของบัญชีปัจจุบัน
        myProducts = allProducts.filter((p) => Number(p.user_id) === Number(currentUser.id));
      }

      if (ordersRes.ok) {
        const ordersData: OrderListResponse = await ordersRes.json();
        // OrderController@index กรองเฉพาะออเดอร์ที่มีสินค้าของ Seller คนนี้มาให้แล้วใน .data
        myOrders = Array.isArray(ordersData) ? ordersData : (ordersData.data || []);
      }

      const totalProds = myProducts.length;
      const outOfStock = myProducts.filter((p) => Number(p.stock_quantity ?? p.stock ?? 0) <= 0).length;
      const pendingOrds = myOrders.filter((o) => (o.status || o.order_status) === 'pending').length;
      
      if (!productsRes.ok || !ordersRes.ok || !reportRes.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
      const report = await reportRes.json();
      const todaySalesAmount = Number(report.total_revenue);

      setStats({
        todaySales: todaySalesAmount,
        pendingOrders: pendingOrds,
        totalProducts: totalProds,
        outOfStockProducts: outOfStock
      });

      setRecentOrders(myOrders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('โหลดข้อมูลไม่สำเร็จ กรุณาลองโหลดหน้าใหม่');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const token = localStorage.getItem('token');

    // 🟢 เปิดระบบเช็คสิทธิ์จริงตาม P0 Checklist
    if (!token || !user || (user.role !== 'seller' && user.role !== 'admin')) {
      alert('เฉพาะผู้ขายเท่านั้นที่สามารถเข้าถึงหน้านี้ได้');
      router.push('/');
      return;
    }

    setAdminName(user.first_name || user.name || 'ผู้ขาย');
    fetchDashboardData(token, user);
  }, [router, fetchDashboardData]);

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
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
            <li><Link href="/seller/reports" className="block px-6 py-3">รายงานยอดขาย</Link></li>
            <li>
              <Link href="/seller" className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium">
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
              <Link href="/seller/orders" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">ภาพรวมร้านค้า (Dashboard)</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
              <div className="w-8 h-8 bg-[#1B4D3E] text-white flex items-center justify-center rounded-full font-bold text-sm">
                {adminName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">{adminName}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {error && <p role="alert" className="text-red-700">{error}</p>}
          {loading ? (
            <div className="text-center p-20 text-gray-500 font-bold">กำลังโหลดข้อมูลแดชบอร์ด...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 text-[#1B4D3E] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">ยอดขายรับชำระทั้งหมด</p>
                    <h3 className="text-2xl font-bold text-[#1B4D3E]">฿{stats.todaySales.toLocaleString()}</h3>
                  </div>
                </div>
                
                <div 
                  onClick={() => router.push('/seller/orders')}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
                >
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">รอดำเนินการ (20 รายการล่าสุด)</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
                  </div>
                </div>

                <div 
                  onClick={() => router.push('/seller/products')}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition"
                >
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">สินค้าของฉันทั้งหมด</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">สินค้าหมดสต็อก</p>
                    <h3 className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</h3>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">คำสั่งซื้อล่าสุดของร้าน</h3>
                  <button onClick={() => router.push('/seller/orders')} className="text-sm font-bold text-[#1B4D3E] hover:underline">
                    ดูทั้งหมด →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm">
                        <th className="px-6 py-3 font-bold border-b border-gray-200">รหัสคำสั่งซื้อ</th>
                        <th className="px-6 py-3 font-bold border-b border-gray-200">วันที่</th>
                        <th className="px-6 py-3 font-bold border-b border-gray-200 text-right">ยอดรวม</th>
                        <th className="px-6 py-3 font-bold border-b border-gray-200 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-gray-600 font-medium">ยังไม่มีคำสั่งซื้อในขณะนี้</td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => {
                          const status = order.status || order.order_status || 'pending';
                          return (
                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer" onClick={() => router.push('/seller/orders')}>
                              <td className="px-6 py-4 font-mono font-bold text-[#1B4D3E]">#{order.id}</td>
                              <td className="px-6 py-4">{order.created_at ? new Date(order.created_at).toLocaleDateString('th-TH') : '-'}</td>
                              <td className="px-6 py-4 font-bold text-right text-gray-900">฿{Number(order.total_amount || 0).toLocaleString()}</td>
                              <td className="px-6 py-4 text-center font-bold">
                                {status === 'pending' ? (
                                  <span className="text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full text-xs">รอชำระเงิน</span>
                                ) : status === 'paid' ? (
                                  <span className="text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full text-xs">ชำระเงินแล้ว</span>
                                ) : status === 'shipped' ? (
                                  <span className="text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full text-xs">จัดส่งแล้ว</span>
                                ) : status === 'completed' ? (
                                  <span className="text-green-700 bg-green-100 px-2.5 py-1 rounded-full text-xs">สำเร็จ</span>
                                ) : (
                                  <span className="text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-xs">{status}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
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