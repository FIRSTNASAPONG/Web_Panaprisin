"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const MOCK_CATEGORIES = [
  { id: 1, name: 'พระเครื่อง', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg> },
  { id: 2, name: 'รูปปั้นและทองเหลือง', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg> },
  { id: 3, name: 'เฟอร์นิเจอร์ไม้เก่า', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v7"/></svg> },
  { id: 4, name: 'ของสะสมอื่นๆ', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg> },
];

const FALLBACK_PRODUCTS = [
  { id: 1, name: 'ตู้ไม้สักโบราณ อายุ 50 ปี', price: 15000, image_url: '', stock: 1 },
  { id: 2, name: 'เหรียญกษาปณ์ รัชกาลที่ 5', price: 2500, image_url: '', stock: 5 },
  { id: 3, name: 'พระสมเด็จวัดระฆัง', price: 45000, image_url: '', stock: 0 },
  { id: 4, name: 'แจกันลายครามสมัยอยุธยา', price: 8500, image_url: '', stock: 2 },
  { id: 5, name: 'รูปปั้นทองเหลือง เทพเจ้ากวนอู', price: 3200, image_url: '', stock: 3 },
  { id: 6, name: 'เครื่องพิมพ์ดีดโบราณ', price: 4500, image_url: '', stock: 0 }
];

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const { addToCart } = useCart(); 

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache' // กัน Cache
      },
      cache: 'no-store' // 🟢 ป้องกัน Next.js จำข้อมูลเก่า เพื่อให้สินค้าใหม่ขึ้นทันที
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data)) setProducts(data);
          else if (data && Array.isArray(data.data)) setProducts(data.data);
          else if (data && Array.isArray(data.products)) setProducts(data.products);
          else setProducts(FALLBACK_PRODUCTS); 
        } catch (error) {
          console.warn("Backend ส่งข้อมูลมาผิดพลาด ใช้ข้อมูลจำลองแทน");
          setProducts(FALLBACK_PRODUCTS); 
        }
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setProducts(FALLBACK_PRODUCTS);
      });
  }, []);

  const safeProducts = Array.isArray(products) ? products : FALLBACK_PRODUCTS;

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-6xl flex-grow">
        {/* Banner Section */}
        <div className="bg-[#1B4D3E] rounded-sm mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://placehold.co/1200x400/1B4D3E/1B4D3E')] mix-blend-overlay"></div>
          <div className="py-16 px-8 relative z-10 flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-4xl w-full">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">พณาไพรสิน</h2>
              <p className="text-lg md:text-2xl text-green-100 mb-2 font-medium">
                ของเก่า ของสะสม แต่งบ้าน แต่งสวน, งานไม้เก่า วินเทจ
              </p>
              <p className="text-sm md:text-base text-green-100/80 mb-8">
                โซนล้านนาริมคลอง บ้านถวาย อำเภอหางดง จังหวัดเชียงใหม่ 50230
              </p>
              <a href="/" className="bg-white text-[#1B4D3E] font-bold py-3 px-10 rounded hover:bg-gray-100 transition shadow-lg text-lg inline-block">
                ช้อปเลย
              </a>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white p-4 rounded-sm shadow-sm mb-6">
          <div className="text-gray-500 font-medium mb-4 uppercase text-sm">หมวดหมู่</div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {MOCK_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex flex-col items-center justify-center p-4 border border-transparent hover:border-gray-200 hover:shadow-sm cursor-pointer transition">
                <div className="w-16 h-16 mb-2 bg-gray-50 rounded-full flex items-center justify-center">
                  {cat.icon}
                </div>
                <span className="text-sm text-gray-700 text-center line-clamp-2">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-4 flex justify-between items-end">
          <h2 className="text-[#1B4D3E] text-xl font-bold uppercase tracking-wider border-b-4 border-[#1B4D3E] pb-2 inline-block">
            สินค้าแนะนำประจำวัน
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
          {safeProducts.map((product) => {
            // เช็คสต็อก
            const isOutOfStock = product.stock !== undefined && product.stock <= 0;

            return (
              <a href={`/product/${product.id}`} key={product.id} className="block relative group">
                <div className="bg-white hover:border-[#1B4D3E] border border-transparent hover:shadow-md transition cursor-pointer flex flex-col h-full">
                  <div className="relative pt-[100%]">
                    <img 
                      src={product.image_url ? `http://localhost:8080/storage/${product.image_url}` : "/image_289eb4.jpg"} 
                      alt={product.name} 
                      className="absolute top-0 left-0 w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.src = '/image_289eb4.jpg' }}
                    />
                    
                    {/* 🟢 ป้ายทับรูปภาพกรณีสินค้าหมด */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <span className="text-white font-bold bg-red-600 px-3 py-1 rounded-sm uppercase tracking-wider text-xs">สินค้าหมด</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 flex flex-col flex-grow">
                    <div className="text-sm text-gray-800 line-clamp-2 mb-2 min-h-[40px]">{product.name}</div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-[#1B4D3E] font-bold text-lg">฿{Number(product.price || 0).toLocaleString()}</div>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault(); 
                          if (isOutOfStock) return; // ถ้าของหมดกดไม่ได้
                          
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            image: product.image_url || '/image_289eb4.jpg',
                            quantity: 1
                          });
                          alert('เพิ่มลงตะกร้าสำเร็จ!');
                        }}
                        disabled={isOutOfStock}
                        className={`text-xs px-3 py-1.5 rounded-sm transition z-10 font-medium ${
                          isOutOfStock 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-[#1B4D3E] text-white hover:bg-[#143a2f]'
                        }`}
                      >
                        {isOutOfStock ? 'หมด' : 'ใส่ตะกร้า'}
                      </button>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}