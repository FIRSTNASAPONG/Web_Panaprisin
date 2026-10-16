"use client";

import Link from "next/link";

import Image from "next/image";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

export default function AddProductPage() {
  const router = useRouter();

  // 1. สร้าง State สำหรับเก็บค่าในฟอร์ม
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // State สำหรับจัดการรูปภาพ
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ฟังก์ชันแสดงรูปภาพพรีวิวตอนเลือกไฟล์
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // เก็บไฟล์เตรียมส่งให้ Backend
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

  // โหลดหมวดหมู่จาก Laravel API แทนการกำหนด category_id ตายตัว
  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(false);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "/api"}/categories`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Categories API failed (HTTP ${response.status})`);
        }

        const data: unknown = await response.json();
        if (
          !Array.isArray(data) ||
          !data.every(
            (item) =>
              item !== null &&
              typeof item === "object" &&
              typeof item.id === "number" &&
              typeof item.name === "string"
          )
        ) {
          throw new Error("รูปแบบข้อมูลหมวดหมู่จาก API ไม่ถูกต้อง");
        }

        if (!controller.signal.aborted) {
          setCategories(data as Category[]);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load categories:", error);
          setCategoriesError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    };

    void loadCategories();
    return () => controller.abort();
  }, []);

  // 2. ฟังก์ชันส่งข้อมูลไปยัง Backend Laravel

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("กรุณา Login ด้วยบัญชี Seller ก่อน");
      router.push("/login");
      return;
    }

    if (!category || !categories.some((item) => String(item.id) === category)) {
      alert("กรุณาเลือกหมวดหมู่สินค้าที่มีอยู่ในระบบ");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("category_id", category);
      formData.append("stock_quantity", stock);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/products`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const body = await res.text();
        console.error("Non-JSON API response:", res.status, body);
        throw new Error(`API ส่งข้อมูลที่ไม่ใช่ JSON (${res.status})`);
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("Product API failed:", {
          status: res.status,
          statusText: res.statusText,
          response: data,
        });

        const validationDetails = data.errors
          ? Object.values(data.errors).flat().join("\n")
          : "";

        throw new Error(
          validationDetails ||
            data.message ||
            `บันทึกสินค้าไม่สำเร็จ (HTTP ${res.status})`,
        );
      }

      alert("เพิ่มสินค้าสำเร็จ");
      router.push("/seller");
    } catch (error) {
      console.error("Add product error:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
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
                href="/seller/add-product"
                className="flex items-center gap-3 px-6 py-3 bg-white/10 border-l-4 border-white text-white font-medium"
              >
                เพิ่มสินค้าใหม่
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8 shrink-0 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">เพิ่มสินค้าใหม่</h1>
        </header>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {/* กล่อง 1: ข้อมูลพื้นฐาน */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              {/* เปลี่ยนหัวข้อให้ใหญ่และหนาขึ้น */}
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                ข้อมูลพื้นฐาน
              </h2>
              <div className="space-y-5">
                <div>
                  {/* เปลี่ยน Label เป็นตัวหนา (font-bold) ตัวใหญ่ขึ้น (text-base) และสีเข้ม (text-gray-900) */}
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    ชื่อสินค้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    หมวดหมู่
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={categoriesLoading || categoriesError || categories.length === 0}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/50 focus:border-[#1B4D3E] text-gray-900 bg-white transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {categoriesLoading
                        ? "กำลังโหลดหมวดหมู่..."
                        : categoriesError
                          ? "โหลดหมวดหมู่ไม่สำเร็จ"
                          : categories.length === 0
                            ? "ยังไม่มีหมวดหมู่สินค้า"
                            : "เลือกหมวดหมู่..."}
                    </option>
                    {categories.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-900 mb-2">
                    รายละเอียดสินค้า
                  </label>
                  <textarea
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
                    <Image unoptimized loading="eager" width={400} height={400}
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm font-medium">
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
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 font-medium">
                    รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
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
                    required
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
                    required
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
                disabled={loading || categoriesLoading || categoriesError || categories.length === 0}
                className="px-8 py-3 bg-[#1B4D3E] text-white rounded-md font-bold hover:bg-[#143a2f] shadow-md transition disabled:bg-gray-400"
              >
                {loading ? "กำลังบันทึก..." : "บันทึกและเผยแพร่"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
