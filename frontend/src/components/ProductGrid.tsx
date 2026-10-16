"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import type { Product, ProductListResponse } from "@/types/api";
import { useCart } from "../context/CartContext";
import { getProductImageUrl } from "@/lib/image";

const MOCK_CATEGORIES = [
  {
    id: 1,
    name: "พระเครื่อง",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]">
        <path d="M6 3h12l4 6-10 13L2 9Z" />
        <path d="M11 3 8 9l4 13 4-13-3-6" />
        <path d="M2 9h20" />
      </svg>
    ),
  },
  {
    id: 2,
    name: "รูปปั้นและทองเหลือง",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" y1="22" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 3,
    name: "เฟอร์นิเจอร์ไม้เก่า",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]">
        <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
        <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M4 18v2" />
        <path d="M20 18v2" />
        <path d="M12 4v7" />
      </svg>
    ),
  },
  {
    id: 4,
    name: "ของสะสมอื่นๆ",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4D3E]">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 17v2" />
        <path d="M13 11v2" />
      </svg>
    ),
  },
];

export default function ProductGrid({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/products`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        const data: ProductListResponse = await res.json();
        if (Array.isArray(data)) setProducts(data);
        else if (data && Array.isArray(data.data)) setProducts(data.data);
        else if (data && Array.isArray(data.products)) setProducts(data.products);
      })
      .catch((err) => {
        console.warn("Failed to fetch products:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🟢 กรองสินค้าตามหมวดหมู่ที่คลิก และคำค้นหาจาก Navbar
  const filteredProducts = products.filter((product: any) => {
    const prodCatId = Number(product.category_id ?? product.category?.id ?? 0);
    const matchesCategory =
      selectedCategory === null || prodCatId === selectedCategory;

    const prodName = String(product.name || "").toLowerCase();
    const prodDesc = String(product.description || "").toLowerCase();
    const matchesSearch =
      !searchQuery ||
      prodName.includes(searchQuery) ||
      prodDesc.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  const activeCategoryName = MOCK_CATEGORIES.find(
    (c) => c.id === selectedCategory
  )?.name;

  return (
    <>
      {/* Categories Section (คลิกเลือกหมวดหมู่ได้) */}
      <div className="bg-white p-4 rounded-sm shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-500 font-medium uppercase text-sm">
            หมวดหมู่
          </div>
          {selectedCategory !== null && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-[#1B4D3E] font-bold hover:underline"
            >
              แสดงทุกหมวดหมู่ ✕
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {MOCK_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSelectedCategory(isSelected ? null : cat.id)
                }
                className={`flex flex-col items-center justify-center p-4 border rounded-sm cursor-pointer transition ${
                  isSelected
                    ? "border-[#1B4D3E] bg-green-50/70 shadow-sm ring-1 ring-[#1B4D3E]"
                    : "border-transparent hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-16 h-16 mb-2 rounded-full flex items-center justify-center transition ${
                    isSelected ? "bg-white shadow-sm" : "bg-gray-50"
                  }`}
                >
                  {cat.icon}
                </div>
                <span
                  className={`text-sm text-center line-clamp-2 ${
                    isSelected ? "text-[#1B4D3E] font-bold" : "text-gray-700"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Header */}
      <div
        id="products"
        className="mb-4 flex flex-wrap justify-between items-end gap-2"
      >
        <h2 className="text-[#1B4D3E] text-xl font-bold uppercase tracking-wider border-b-4 border-[#1B4D3E] pb-2 inline-block">
          {activeCategoryName
            ? `หมวดหมู่: ${activeCategoryName}`
            : searchQuery
            ? `ผลการค้นหา: "${searchParams.get("search")}"`
            : "สินค้าแนะนำประจำวัน"}
        </h2>

        {(selectedCategory !== null || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              if (searchQuery) router.push("/");
            }}
            className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-sm font-bold hover:bg-gray-50 transition"
          >
            ดูสินค้าทั้งหมด
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white p-12 text-center text-gray-500 font-medium rounded-sm shadow-sm">
          กำลังโหลดรายการสินค้า...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 font-medium rounded-sm shadow-sm flex flex-col items-center gap-3">
          <p>ไม่พบสินค้าในหมวดหมู่หรือคำค้นหานี้</p>
          {(selectedCategory !== null || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                if (searchQuery) router.push("/");
              }}
              className="bg-[#1B4D3E] text-white px-5 py-2 rounded-sm text-xs font-bold hover:bg-[#143a2f] transition"
            >
              แสดงสินค้าทั้งหมด
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
          {filteredProducts.map((product) => {
            const stockCount = Number(
              product.stock_quantity ?? product.stock ?? 0
            );
            const isOutOfStock = stockCount <= 0;

            return (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className="block relative group"
              >
                <div className="bg-white hover:border-[#1B4D3E] border border-transparent hover:shadow-md transition cursor-pointer flex flex-col h-full">
                  <div className="relative pt-[100%]">
                    <Image
                      unoptimized
                      loading="eager"
                      width={400}
                      height={400}
                      src={getProductImageUrl(
                        product.image_url || product.image
                      )}
                      alt={product.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/image_289eb4.jpg";
                      }}
                    />

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                        <span className="text-white font-bold bg-red-600 px-3 py-1 rounded-sm uppercase tracking-wider text-xs">
                          สินค้าหมด
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 flex flex-col flex-grow">
                    <div className="text-sm text-gray-800 line-clamp-2 mb-1 min-h-[40px]">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      คงเหลือ {stockCount} ชิ้น
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-[#1B4D3E] font-bold text-lg">
                        ฿{Number(product.price || 0).toLocaleString()}
                      </div>

                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (isOutOfStock) return;

                          const ok = await addToCart({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            image: product.image_url || "/image_289eb4.jpg",
                            quantity: 1,
                          });
                          if (ok) {
                            alert(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว!`);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`text-xs px-3 py-1.5 rounded-sm transition z-10 font-medium ${
                          isOutOfStock
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-[#1B4D3E] text-white hover:bg-[#143a2f]"
                        }`}
                      >
                        {isOutOfStock ? "หมด" : "ใส่ตะกร้า"}
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}