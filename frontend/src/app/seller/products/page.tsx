"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('ผู้ดูแลระบบ');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // ข้อมูลจำลองเผื่อ Backend ยังไม่เสร็จ
  const FALLBACK_PRODUCTS = [
    { id: 1, name: 'ตู้ไม้สักโบราณ อายุ 50 ปี', category: 'เฟอร์นิเจอร์ไม้เก่า', price: 15000, stock: 1, image_url: '' },
    { id: 2, name: 'เหรียญกษาปณ์ รัชกาลที่ 5', category: 'ของสะสมอื่นๆ', price: 2500, stock: 5, image_url: '' },
    { id: 3, name: 'พระสมเด็จวัดระฆัง', category: 'พระเครื่อง', price: 45000, stock: 0, image_url: '' },
  ];

  useEffect(() => {
    setAdminName('สมชาย (Dev Mode)');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
      
      if (res.ok) {
        const data = await res.json();
        // รองรับทั้งแบบส่งมาเป็น array เลย หรือซ้อนใน data
        const productList = Array.isArray(data) ? data : (data.data || data.products || FALLBACK_PRODUCTS);
        setProducts(productList);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${name}"?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        alert('ลบสินค้าสำเร็จ!');
        // อัปเดตตารางโดยเอาตัวที่ลบออก
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('เกิดข้อผิดพลาดในการลบสินค้า');
      }
    } catch (error) {
      console.error('Delete error:', error);
      // 🔴 Dev Mode Fallback: แกล้งทำเป็นว่าลบสำเร็จ
      alert('[Dev Mode] จำลองการลบสินค้าสำเร็จ');
      setProducts(products.filter(p => p.id !== id));
    } finally {
      setDeleteLoading(null);
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
            <li>
              <a href="/seller/products" className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium">
                จัดการสินค้าทั้งหมด
              </a>
            </li>
            <li>
              <a href="/seller/add-product" className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition">
                เพิ่มสินค้าใหม่
              </a>
            </li>
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
        
        {/* Top Navbar */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200 z-10">
          <h1 className="text-xl font-bold text-gray-800">คลังสินค้า</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/seller/add-product')}
              className="bg-[#1B4D3E] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#143a2f] transition shadow-sm"
            >
              + เพิ่มสินค้าใหม่
            </button>
            <div className="flex items-center gap-2 border-l pl-4 border-gray-300">
              <div className="w-8 h-8 bg-[#1B4D3E] text-white flex items-center justify-center rounded-full font-bold text-sm">ส</div>
              <span className="text-sm font-medium text-gray-700">{adminName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">รายการสินค้าทั้งหมด ({products.length} รายการ)</h2>
            </div>

            {loading ? (
              <div className="p-20 text-center text-gray-500 font-bold">กำลังโหลดข้อมูลสินค้า...</div>
            ) : products.length === 0 ? (
              <div className="p-20 text-center text-gray-500 font-bold flex flex-col items-center">
                <p className="mb-4">ยังไม่มีสินค้าในคลัง</p>
                <button onClick={() => router.push('/seller/add-product')} className="bg-[#1B4D3E] text-white px-6 py-2 rounded-md font-bold text-sm">เพิ่มสินค้าชิ้นแรกเลย</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                      <th className="px-6 py-4 font-bold w-20">รูปภาพ</th>
                      <th className="px-6 py-4 font-bold">ชื่อสินค้า</th>
                      <th className="px-6 py-4 font-bold">หมวดหมู่</th>
                      <th className="px-6 py-4 font-bold text-right">ราคา (บาท)</th>
                      <th className="px-6 py-4 font-bold text-center">คลัง (ชิ้น)</th>
                      <th className="px-6 py-4 font-bold text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition group">
                        <td className="px-6 py-3">
                          <div className="w-14 h-14 bg-gray-100 rounded-sm border border-gray-200 overflow-hidden flex items-center justify-center">
                            {product.image_url || product.image ? (
                              <img 
                                src={`http://localhost:8080/storage/${product.image_url || product.image}`} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = '/image_289eb4.jpg' }}
                              />
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold">ไม่มีรูป</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-gray-500">{product.category || '-'}</td>
                        <td className="px-6 py-4 font-bold text-right text-[#1B4D3E]">{(product.price || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          {product.stock > 0 ? (
                            <span className="font-bold text-gray-900">{product.stock}</span>
                          ) : (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">หมด</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            {/* ปุ่มแก้ไข (อนาคตค่อยทำหน้า /seller/edit-product/[id] ก็ได้) */}
                            <button 
                              onClick={() => alert('ระบบแก้ไขสินค้ากำลังพัฒนา')}
                              className="text-blue-600 hover:text-blue-800 font-bold transition"
                            >
                              แก้ไข
                            </button>
                            <span className="text-gray-300">|</span>
                            {/* ปุ่มลบ */}
                            <button 
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              disabled={deleteLoading === product.id}
                              className={`font-bold transition ${
                                deleteLoading === product.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'
                              }`}
                            >
                              {deleteLoading === product.id ? 'กำลังลบ...' : 'ลบ'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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