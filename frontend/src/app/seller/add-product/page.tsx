"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { errorMessage as apiErrorMessage } from "@/lib/account";
import { getProductImageUrl } from "@/lib/image";
import type { Product } from "@/types/api";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

// JSON from an external API must be validated before use.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCategory(value: unknown): value is Category {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0
  );
}

function parseCategories(payload: unknown): Category[] {
  let list: unknown = payload;
  if (isRecord(payload)) {
    list = payload.data ?? payload.categories;
  }
  if (!Array.isArray(list)) {
    throw new Error("รูปแบบข้อมูลหมวดหมู่ไม่ถูกต้อง");
  }
  return (list as unknown[]).filter(isCategory);
}

function getApiError(payload: unknown, status: number): string {
  if (isRecord(payload)) {
    if (isRecord(payload.errors)) {
      const details = Object.values(payload.errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === "string")
        .join("\n");
      if (details) return details;
    }
    if (typeof payload.message === "string") return payload.message;
  }
  return `บันทึกสินค้าไม่สำเร็จ (HTTP ${status})`;
}

export default function AddProductPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const editId = params.id;
  const [productReady, setProductReady] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    const controller = new AbortController();
    setProductReady(false);
    api.get<Product>(`/products/${encodeURIComponent(editId)}`, { signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      setName(data.name); setCategory(String(data.category_id));
      setDescription(data.description || ''); setPrice(String(data.price));
      setStock(String(data.stock_quantity));
      if (data.image_url) setImagePreview(getProductImageUrl(data.image_url));
      setProductReady(true);
    }).catch((error: unknown) => { if (!controller.signal.aborted) setErrorMessage(apiErrorMessage(error)); });
    return () => controller.abort();
  }, [editId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB ครับ");
        e.target.value = "";
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const token = localStorage.getItem("token");

    if (!token || !user || (user.role !== "seller" && user.role !== "admin")) {
      alert("เฉพาะผู้ขายเท่านั้นที่สามารถเข้าถึงหน้านี้ได้");
      router.push("/");
    }
  }, [router]);

  // โหลด ID หมวดหมู่จริงจากฐานข้อมูล ไม่เดา ID เมื่อ API ใช้งานไม่ได้
  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "/api"}/categories`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!response.ok) {
          throw new Error(`โหลดหมวดหมู่ไม่สำเร็จ (HTTP ${response.status})`);
        }

        const payload: unknown = await response.json();
        const normalized = parseCategories(payload);
        if (!controller.signal.aborted) {
          setCategories(normalized);

          if (normalized.length === 0) {
            setCategoriesError("ยังไม่มีหมวดหมู่สินค้า กรุณาติดต่อผู้ดูแลระบบ");
          }
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setCategories([]);

          setCategoriesError(
            error instanceof Error ? error.message : "โหลดหมวดหมู่ไม่สำเร็จ"
          );
        }
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    };

    void loadCategories();
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || (editId && !productReady)) return;
    setErrorMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      alert("กรุณา Login ด้วยบัญชี Seller ก่อน");
      router.push("/login");
      return;
    }

    if (!categories.some((item) => String(item.id) === category)) {
      setErrorMessage("กรุณาเลือกหมวดหมู่สินค้า");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("price", String(Number(price)));
      formData.append("category_id", String(Number(category)));
      formData.append("stock_quantity", String(parseInt(stock, 10) || 0));

      formData.append("description", description.trim());
      if (editId) formData.append("_method", "PATCH");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/products${editId ? `/${editId}` : ""}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`เซิร์ฟเวอร์ตอบกลับผิดรูปแบบ (HTTP ${res.status})`);
      }

      const data: unknown = await res.json();

      if (!res.ok) {
        throw new Error(getApiError(data, res.status));
      }

      alert("บันทึกสินค้าสำเร็จ");
      router.push("/seller/products");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

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
            <li>
              <Link
                href="/seller"
                className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition"
              >
                แดชบอร์ด
              </Link>
            </li>
            <li>
              <Link
                href="/seller/products"
                className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition"
              >
                จัดการสินค้าทั้งหมด
              </Link>
            </li>
            <li>
              <Link
                href="/seller/add-product"
                className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium"
              >
                เพิ่มสินค้าใหม่
              </Link>
            </li>
            <li>
              <Link
                href="/seller/orders"
                className="flex items-center gap-3 px-6 py-3 text-green-100 hover:bg-white/5 hover:text-white transition"
              >
                จัดการคำสั่งซื้อ
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-6 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 text-green-200 hover:text-white transition text-sm"
          >
            กลับสู่หน้าร้านค้า
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">{editId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50"
        >
          <fieldset disabled={!!editId && !productReady} className="max-w-4xl mx-auto space-y-6">
            {editId && !productReady && !errorMessage && <p role="status">กำลังโหลดสินค้า...</p>}
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-sm text-sm font-medium whitespace-pre-line">
                {errorMessage}
              </div>
            )}

            {/* กล่อง 1: ข้อมูลพื้นฐาน */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                ข้อมูลพื้นฐาน
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    ชื่อสินค้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    aria-label="ชื่อสินค้า"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    หมวดหมู่ <span className="text-red-500">*</span>
                  </label>
                  <select aria-label="หมวดหมู่"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={categoriesLoading || categories.length === 0}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900 bg-white transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {categoriesLoading
                        ? "กำลังโหลดหมวดหมู่..."
                        : categoriesError
                          ? "ไม่สามารถเลือกหมวดหมู่ได้"
                          : "เลือกหมวดหมู่..."}
                    </option>
                    {categories.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {categoriesError && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {categoriesError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    รายละเอียดสินค้า
                  </label>
                  <textarea aria-label="รายละเอียดสินค้า"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900 transition"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* กล่อง 2: รูปภาพสินค้า */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                รูปภาพสินค้า
              </h2>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden shrink-0">
                  {imagePreview ? (
                    <Image
                      unoptimized
                      loading="eager"
                      width={400}
                      height={400}
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm font-medium">
                      ไม่มีรูปภาพ
                    </span>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer bg-white border-2 border-[#1B4D3E] text-[#1B4D3E] px-4 py-2 rounded-md font-bold hover:bg-green-50 transition text-sm inline-block mb-2">
                    เลือกไฟล์รูปภาพ
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 font-medium">
                    รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* กล่อง 3: ข้อมูลการขาย */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                ข้อมูลการขาย
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    ราคา (บาท) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    aria-label="ราคา (บาท)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    คลัง (ชิ้น)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    aria-label="คลัง (ชิ้น)"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900 transition"
                  />
                </div>
              </div>
            </div>

            {/* ปุ่มกดบันทึก */}
            <div className="flex justify-end gap-3 pt-4 pb-10">
              <button
                type="button"
                onClick={() => router.push("/seller")}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-bold hover:bg-gray-100 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={(!!editId && !productReady) || loading || categoriesLoading || categories.length === 0 || Boolean(categoriesError)}
                className="px-8 py-3 bg-[#1B4D3E] text-white rounded-md font-bold hover:bg-[#143a2f] shadow-md transition disabled:bg-gray-400"
              >
                {loading ? "กำลังบันทึก..." : "บันทึกและเผยแพร่"}
              </button>
            </div>
          </fieldset>
        </form>
      </main>
    </div>
  );
}