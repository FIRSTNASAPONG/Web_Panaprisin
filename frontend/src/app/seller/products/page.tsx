"use client";

import Image from "next/image";

import type { Product, ProductListResponse, User } from "@/types/api";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProductImageUrl } from "@/lib/image";
import Link from "next/link";

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [adminName, setAdminName] = useState('ผู้ขาย');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const fetchProducts = useCallback(async (currentUser: User) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/me/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data: ProductListResponse = await res.json();
        const allProducts = Array.isArray(data) ? data : (data.data || data.products || []);
        // แสดงเฉพาะสินค้าของบัญชีปัจจุบัน
        const myProducts = allProducts.filter((p) => Number(p.user_id) === Number(currentUser.id));
        setProducts(myProducts);
      } else {
        throw new Error('โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      setError('โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const token = localStorage.getItem('token');

    if (!token || !user || (user.role !== 'seller' && user.role !== 'admin')) {
      alert('เฉพาะผู้ขายเท่านั้นที่สามารถเข้าถึงหน้านี้ได้');
      router.push('/');
      return;
    }

    setAdminName(user.first_name || user.name || 'ผู้ขาย');
    fetchProducts(user);
  }, [router, fetchProducts, attempt]);

  // ฟังก์ชันลบสินค้า (แนบ Token)
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการนำสินค้าออกจากหน้าร้าน (ประวัติคำสั่งซื้อจะยังอยู่) "${name}"?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    setDeleteLoading(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert('ลบสินค้าสำเร็จ!');
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert(data.message || 'ไม่สามารถลบสินค้าได้');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setDeleteLoading(null);
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
              <Link href="/seller/products" className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium">
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
      <main className="min-w-0 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200 z-10">
          <h1 className="text-xl font-bold text-gray-800">คลังสินค้าของฉัน</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/seller/add-product')}
              className="bg-[#1B4D3E] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#143a2f] transition shadow-sm"
            >
              + เพิ่มสินค้าใหม่
            </button>
            <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
              <div className="w-8 h-8 bg-[#1B4D3E] text-white flex items-center justify-center rounded-full font-bold text-sm">
                {adminName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700">{adminName}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">รายการสินค้าของฉัน ({products.length} รายการ)</h2>
            </div>

            {error ? <div role="alert" className="p-6">{error} <button className="underline" onClick={() => setAttempt(value => value + 1)}>ลองอีกครั้ง</button></div> : loading ? (
              <div className="p-20 text-center text-gray-500 font-bold">กำลังโหลดข้อมูลสินค้า...</div>
            ) : products.length === 0 ? (
              <div className="p-20 text-center text-gray-500 font-bold flex flex-col items-center">
                <p className="mb-4">ยังไม่มีสินค้าในคลังของคุณ</p>
                <button onClick={() => router.push('/seller/add-product')} className="bg-[#1B4D3E] text-white px-6 py-2 rounded-md font-bold text-sm">เพิ่มสินค้าชิ้นแรกเลย</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                      <th className="px-6 py-4 font-bold w-20">รูปภาพ</th>
                      <th className="px-6 py-4 font-bold">ชื่อสินค้า</th>
                      <th className="px-6 py-4 font-bold text-right">ราคา (บาท)</th>
                      <th className="px-6 py-4 font-bold text-center">คลัง (ชิ้น)</th>
                      <th className="px-6 py-4 font-bold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                    {products.map((product) => {
                      const stockCount = Number(product.stock_quantity ?? product.stock ?? 0);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition group">
                          <td className="px-6 py-3">
                            <div className="w-14 h-14 bg-gray-100 rounded-sm border border-gray-200 overflow-hidden flex items-center justify-center">
                              {product.image_url ? (
                                <Image unoptimized loading="eager" width={56} height={56}
                                  src={getProductImageUrl(product.image_url || product.image)}
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = '/image_289eb4.jpg' }}
                                />
                              ) : (
                                <span className="text-[10px] text-gray-600 font-bold">ไม่มีรูป</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                          <td className="px-6 py-4 font-bold text-right text-[#1B4D3E]">{Number(product.price || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            {stockCount > 0 ? (
                              <span className="font-bold text-gray-900">{stockCount}</span>
                            ) : (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">หมด (0)</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link href={`/seller/products/${product.id}/edit`} className="text-[#1B4D3E] font-bold mr-4 hover:underline">แก้ไข</Link>
                            <button 
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              disabled={deleteLoading === product.id}
                              className={`font-bold transition ${
                                deleteLoading === product.id ? 'text-gray-600 cursor-not-allowed' : 'text-red-600 hover:text-red-800'
                              }`}
                            >
                              {deleteLoading === product.id ? 'กำลังลบ...' : 'ลบ'}
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
    </div>
  );
}