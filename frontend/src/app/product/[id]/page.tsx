"use client";

import ProductReviews from "@/components/ProductReviews";
import WishlistButton from "@/components/WishlistButton";
import Image from "next/image";
import type { Product } from "@/types/api";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getProductImageUrl } from "@/lib/image";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

      fetch(`${apiUrl}/products/${productId}`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      })
        .then(async (res) => {
          if (!res.ok) {
            setProduct(null);
            return;
          }
          const data = await res.json();
          if (data && data.data) {
            setProduct(data.data);
          } else if (data && data.id) {
            setProduct(data);
          } else {
            setProduct(null);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch product:', err);
          setProduct(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [productId]);

  const maxStock = product ? Number(product.stock_quantity ?? product.stock ?? 0) : 0;
  const isOutOfStock = maxStock <= 0;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const handleAddToCart = async (redirectToCart = false) => {
    if (!product || isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      const ok = await addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image_url || product.image || '/image_289eb4.jpg',
        quantity: quantity
      });

      if (ok) {
        if (redirectToCart) {
          router.push('/cart');
        } else {
          alert(`เพิ่ม "${product.name}" ลงตะกร้าสำเร็จ!`);
        }
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-gray-500 font-medium animate-pulse">กำลังโหลดข้อมูลสินค้า...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center gap-4">
          <div className="text-gray-600 font-bold text-lg">ไม่พบข้อมูลสินค้าที่ค้นหา</div>
          <button onClick={() => router.push('/')} className="bg-[#1B4D3E] text-white px-6 py-2 rounded-sm font-bold text-sm">
            กลับไปหน้าแรก
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col">
      <Navbar />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-6xl py-4">
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <Link href="/" className="text-[#1B4D3E] hover:underline">พณาไพรสิน</Link>
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
              <div className="aspect-square w-full bg-gray-100 mb-4 border border-gray-200 relative">
                <Image unoptimized loading="eager" width={600} height={600}
                  src={getProductImageUrl(product.image_url || product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/image_289eb4.jpg' }}
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold bg-red-600 px-4 py-1.5 rounded-sm uppercase text-sm">สินค้าหมด</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="w-full md:w-3/5 flex flex-col">
              <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-3">{product.name}</h1>

              <p className="text-[#1B4D3E] mb-4" data-testid="product-rating">
                {product.average_rating == null ? 'ยังไม่มีรีวิว' : `${Number(product.average_rating).toFixed(1)} / 5 ★ (${product.reviews_count} รีวิว)`}
              </p>

              <WishlistButton productId={product.id} />
              <div className="bg-gray-50 py-4 px-5 mb-6 flex items-end gap-3">
                <span className="text-[#1B4D3E] text-3xl font-medium">฿{Number(product.price || 0).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-6 mb-8 text-sm">
                <span className="text-gray-500 w-16">จำนวน</span>
                <div className="flex items-center">
                  <div className="flex border border-gray-300 rounded-sm overflow-hidden h-8">
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity <= 1}
                      onClick={handleDecrease}
                      className="w-8 flex items-center justify-center hover:bg-gray-100 border-r border-gray-300 text-gray-600 transition disabled:opacity-40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                    </button>
                    <input
                      type="text"
                      value={isOutOfStock ? 0 : quantity}
                      readOnly
                      className="w-12 text-center text-gray-900 focus:outline-none bg-white"
                    />
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity >= maxStock}
                      onClick={handleIncrease}
                      className="w-8 flex items-center justify-center hover:bg-gray-100 border-l border-gray-300 text-gray-600 transition disabled:opacity-40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    </button>
                  </div>
                  <span className={`ml-4 font-medium ${isOutOfStock ? 'text-red-600' : 'text-gray-500'}`}>
                    {isOutOfStock ? 'สินค้าหมดสต็อก' : `มีสินค้าทั้งหมด ${maxStock} ชิ้น`}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4">
                <button
                  type="button"
                  disabled={isOutOfStock || isAdding}
                  onClick={() => handleAddToCart(false)}
                  className={`flex items-center justify-center gap-2 border px-6 py-3 rounded-sm font-medium transition ${
                    isOutOfStock
                      ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-[#1B4D3E] bg-[#1B4D3E]/10 text-[#1B4D3E] hover:bg-[#1B4D3E]/20'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M12 9v6"/><path d="M9 12h6"/></svg>
                  {isAdding ? 'กำลังเพิ่ม...' : 'เพิ่มไปยังรถเข็น'}
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock || isAdding}
                  onClick={() => handleAddToCart(true)}
                  className={`px-10 py-3 rounded-sm font-medium transition ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#1B4D3E] text-white hover:bg-[#143a2f]'
                  }`}
                >
                  {isOutOfStock ? 'สินค้าหมด' : 'ซื้อสินค้า'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Info Profile */}
        <div className="bg-white rounded-sm shadow-sm p-6 mb-4 flex items-center justify-between border-l-4 border-[#1B4D3E]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
              <Image unoptimized loading="eager" width={64} height={64} src="/image_289eb4.jpg" alt="พณาไพรสิน" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-lg">พณาไพรสิน</h3>

              <div className="flex gap-2">
                <Link href="/" className="flex items-center gap-1 border border-gray-300 text-gray-600 px-3 py-1 text-xs rounded-sm hover:bg-gray-50 transition">
                  ดูร้านค้า
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-white rounded-sm shadow-sm p-6">
          <h2 className="bg-gray-50 p-3 text-lg font-medium text-gray-900 mb-4 uppercase">รายละเอียดสินค้า</h2>
          <div className="px-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description || 'ไม่มีรายละเอียดสินค้าเพิ่มเติม'}
          </div>
        </div>
        <ProductReviews productId={product.id} />
      </main>

      <Footer />
    </div>
  );
}
