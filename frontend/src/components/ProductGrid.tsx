"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, ProductListResponse } from "@/types/api";
import { useCart } from "../context/CartContext";
import { getProductImageUrl } from "@/lib/image";

export default function ProductGrid({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const { addToCart } = useCart();

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

  if (loading) {
    return (
      <div className="bg-white p-12 text-center text-gray-500 font-medium rounded-sm shadow-sm">
        กำลังโหลดรายการสินค้า...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white p-12 text-center text-gray-500 font-medium rounded-sm shadow-sm">
        ยังไม่มีสินค้าในระบบขณะนี้
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
      {products.map((product) => {
        const stockCount = Number(product.stock_quantity ?? product.stock ?? 0);
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
                  src={getProductImageUrl(product.image_url || product.image)}
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
  );
}