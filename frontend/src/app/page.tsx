import React, { Suspense } from 'react';
import type { Product, ProductListResponse } from "@/types/api";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';

async function getInitialProducts(): Promise<Product[]> {
  const internalUrl = process.env.INTERNAL_API_URL || "http://nginx/api";
  try {
    const res = await fetch(`${internalUrl}/products`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data: ProductListResponse = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.products)) return data.products;
    return [];
  } catch {
    return [];
  }
}

export default async function App() {
  const initialProducts = await getInitialProducts();

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-6 max-w-6xl flex-grow">
        {/* Banner Section */}
        <div className="bg-[#1B4D3E] rounded-sm mb-6 relative overflow-hidden">
          <div className="py-16 px-8 relative z-10 flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-4xl w-full">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">พณาไพรสิน</h2>
              <p className="text-lg md:text-2xl text-green-100 mb-2 font-medium">
                ของเก่า ของสะสม แต่งบ้าน แต่งสวน, งานไม้เก่า วินเทจ
              </p>
              <p className="text-sm md:text-base text-green-100/80 mb-8">
                โซนล้านนาริมคลอง บ้านถวาย อำเภอหางดง จังหวัดเชียงใหม่ 50230
              </p>
              <a href="#products" className="bg-white text-[#1B4D3E] font-bold py-3 px-10 rounded hover:bg-gray-100 transition shadow-lg text-lg inline-block">
                ช้อปเลย
              </a>
            </div>
          </div>
        </div>

        {/* Categories & Products Grid */}
        <Suspense
          fallback={
            <div className="bg-white p-12 text-center text-gray-500 font-medium rounded-sm shadow-sm">
              กำลังโหลดรายการสินค้า...
            </div>
          }
        >
          <ProductGrid initialProducts={initialProducts} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}