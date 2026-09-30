"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

// ข้อมูลจำลองแบบเต็ม สำหรับหน้ารายละเอียด
const MOCK_PRODUCTS_DETAILS = [
  {
    id: 1,
    name: 'พระสมเด็จวัดระฆัง พิมพ์ใหญ่',
    price: 1500000,
    sold: 1,
    stock: 2,
    rating: 5.0,
    reviews: 1,
    images: ['https://placehold.co/800x800/1B4D3E/FFFFFF?text=Amulet+1'], 
    description: 'พระสมเด็จวัดระฆัง พิมพ์ใหญ่\n\nเนื้อหนึกนุ่ม มวลสารครบถ้วน สภาพสวยสมบูรณ์ ไม่ผ่านการใช้งานหรือล้างผิว รับประกันพระแท้ 100% ตลอดชีพ สามารถส่งตรวจเช็คสถาบันหลักได้เลยครับ',
    category: 'พระเครื่อง'
  },
  {
    id: 2,
    name: 'สิงห์ทองเหลืองโบราณ คู่',
    price: 8500,
    sold: 4,
    stock: 10,
    rating: 4.8,
    reviews: 3,
    images: ['https://placehold.co/800x800/1B4D3E/FFFFFF?text=Brass+Lion'],
    description: 'สิงห์ทองเหลืองโบราณ 1 คู่ ศิลปะสวยงาม หล่อหนา น้ำหนักดี เหมาะสำหรับตั้งโชว์เพื่อเสริมบารมีหรือปรับฮวงจุ้ยในบ้าน',
    category: 'รูปปั้นและทองเหลือง'
  },
  {
    id: 3,
    name: 'ตู้ไม้สักแกะสลัก ลายไทย',
    price: 25000,
    sold: 2,
    stock: 1,
    rating: 4.9,
    reviews: 2,
    images: ['https://placehold.co/800x800/1B4D3E/FFFFFF?text=Teak+Cabinet'],
    description: 'ตู้ไม้สักแท้แกะสลักลายไทยทั้งใบ งานช่างฝีมือยุคเก่า ไม้แห้งสนิทไม่มีปลวกมอด สภาพแข็งแรงทนทาน ขนาด กว้าง 120 x สูง 180 ซม.',
    category: 'เฟอร์นิเจอร์ไม้เก่า'
  },
  {
    id: 4,
    name: 'เหรียญ ร.5 รัชมังคลาภิเศก',
    price: 12000,
    sold: 8,
    stock: 5,
    rating: 5.0,
    reviews: 6,
    images: ['https://placehold.co/800x800/1B4D3E/FFFFFF?text=Coin'],
    description: 'เหรียญที่ระลึก รัชกาลที่ 5 รัชมังคลาภิเศก ร.ศ.127 สภาพสวย ตัวหนังสือคมชัด หูเชื่อมเดิมๆ เป็นของสะสมที่หายากและทรงคุณค่า',
    category: 'เหรียญกษาปณ์'
  },
  {
    id: 5,
    name: 'ชามเบญจรงค์ สมัยอยุธยา',
    price: 45000,
    sold: 1,
    stock: 1,
    rating: 5.0,
    reviews: 1,
    images: ['https://placehold.co/800x800/1B4D3E/FFFFFF?text=Benjarong'],
    description: 'ชามเบญจรงค์ลายเทพนม สมัยอยุธยาตอนปลาย ลงสีเต็มใบ ลายเส้นคมชัด มีบิ่นที่ขอบเล็กน้อยตามกาลเวลา แต่โดยรวมถือว่าสมบูรณ์มาก',
    category: 'เครื่องกระเบื้อง'
  },
  {
    id: 6,
    name: 'ตะกรุดหลวงพ่อเดิม วัดหนองโพ',
    price: 35000,
    sold: 3,
    stock: 1,
    rating: 4.7,
    reviews: 4,
    images: ['https://placehold.co/800x800/1B4D3E/FFFFFF?text=Takrut'],
    description: 'ตะกรุดหลวงพ่อเดิม วัดหนองโพ นครสวรรค์ ถักเชือกลงรักเก่า รักแห้งแตกลายงาตามอายุ ดูง่าย รับประกันความแท้',
    category: 'ของสะสมอื่นๆ'
  },
];

export default function ProductDetailPage() {
  const params = useParams(); 
  const productId = Number(params?.id); 

  const product = MOCK_PRODUCTS_DETAILS.find((p) => p.id === productId) || MOCK_PRODUCTS_DETAILS[0];

  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart(); // ดึงฟังก์ชันตะกร้ามาใช้

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  // ฟังก์ชันเวลากดเพิ่มลงตะกร้า
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col">
      <Navbar />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-6xl py-4">
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <a href="/" className="text-[#1B4D3E] hover:underline">พณาไพรสิน</a>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <a href="#" className="text-[#1B4D3E] hover:underline">{product.category}</a>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          <span className="text-gray-500 truncate">{product.name}</span>
        </div>
      </div>

      {/* Product Main Section */}
      <main className="container mx-auto px-4 max-w-6xl flex-grow mb-8">
        <div className="bg-white rounded-sm shadow-sm p-6 mb-4">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left: Images */}
            <div className="w-full md:w-2/5 shrink-0">
              <div className="aspect-square w-full bg-gray-100 mb-4 border border-gray-200">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="w-full md:w-3/5 flex flex-col">
              <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-3">{product.name}</h1>
              
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center text-[#1B4D3E] font-medium border-b border-[#1B4D3E]">
                  <span className="mr-1">{product.rating.toFixed(1)}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                </div>
                <div className="border-l border-gray-300 h-4"></div>
                <div><span className="border-b border-gray-900 font-medium">{product.reviews}</span> <span className="text-gray-500">เรตติ้ง</span></div>
                <div className="border-l border-gray-300 h-4"></div>
                <div><span className="font-medium text-gray-900">{product.sold}</span> <span className="text-gray-500">ขายแล้ว</span></div>
              </div>

              <div className="bg-gray-50 py-4 px-5 mb-6 flex items-end gap-3">
                <span className="text-[#1B4D3E] text-3xl font-medium">฿{product.price.toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-6 mb-8 text-sm">
                <span className="text-gray-500 w-16">จำนวน</span>
                <div className="flex items-center">
                  <div className="flex border border-gray-300 rounded-sm overflow-hidden h-8">
                    <button onClick={handleDecrease} className="w-8 flex items-center justify-center hover:bg-gray-100 border-r border-gray-300 text-gray-600 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                    </button>
                    <input 
                      type="text" 
                      value={quantity} 
                      readOnly
                      className="w-12 text-center text-gray-900 focus:outline-none"
                    />
                    <button onClick={handleIncrease} className="w-8 flex items-center justify-center hover:bg-gray-100 border-l border-gray-300 text-gray-600 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                  </div>
                  <span className="ml-4 text-gray-500">มีสินค้าทั้งหมด {product.stock} ชิ้น</span>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4">
                {/* ปุ่มเพิ่มตะกร้า ผูกฟังก์ชันเรียบร้อย */}
                <button 
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 border border-[#1B4D3E] bg-[#1B4D3E]/10 text-[#1B4D3E] px-6 py-3 rounded-sm font-medium hover:bg-[#1B4D3E]/20 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M12 9v6"/><path d="M9 12h6"/></svg>
                  เพิ่มไปยังรถเข็น
                </button>
                <button className="bg-[#1B4D3E] text-white px-10 py-3 rounded-sm font-medium hover:bg-[#143a2f] transition">
                  ซื้อสินค้า
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Info Profile */}
        <div className="bg-white rounded-sm shadow-sm p-6 mb-4 flex items-center justify-between border-l-4 border-[#1B4D3E]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
               <img src="/image_289eb4.jpg" alt="พณาไพรสิน" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-lg">พณาไพรสิน</h3>
              <p className="text-sm text-gray-500 mb-1">Active เมื่อ 5 นาทีที่ผ่านมา</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-1 text-xs rounded-sm hover:bg-gray-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  แชทเลย
                </button>
                <a href="/" className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-1 text-xs rounded-sm hover:bg-gray-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  ดูร้านค้า
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-sm shadow-sm p-6">
          <h2 className="bg-gray-50 p-3 text-lg font-medium text-gray-900 mb-4 uppercase">รายละเอียดสินค้า</h2>
          <div className="px-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}