"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { fetchCartFromDB } = useCart();
  const [statusText, setStatusText] = useState("กำลังเข้าสู่ระบบด้วย Google...");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const userParam = params.get("user");
      const error = params.get("error");

      if (error || !token) {
        router.replace("/login?error=GoogleLoginFailed");
        return;
      }

      // 1. บันทึก Token ลง localStorage
      localStorage.setItem("token", token);

      // 2. แปลงข้อมูล User ที่แนบมากับ URL
      let userData: Record<string, any> = {};
      if (userParam) {
        try {
          userData = JSON.parse(userParam);
        } catch {
          try {
            userData = JSON.parse(decodeURIComponent(userParam));
          } catch {
            userData = {};
          }
        }
      }

      // 3. ลองดึงข้อมูล User เต็มๆ จาก API (/api/user) เพื่อให้ได้ first_name และ role ล่าสุด
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      try {
        const res = await fetch(`${apiUrl}/user`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        if (res.ok) {
          const fullUser = await res.json();
          if (fullUser && fullUser.id) {
            userData = { ...userData, ...fullUser };
          }
        }
      } catch {
        // กรณีไม่มี endpoint /api/user ให้ใช้ข้อมูลจาก URL แทน
      }

      // 4. ป้องกันกรณี name เป็น null (เพราะใน DB ใช้คอลัมน์ first_name)
      const fallbackName =
        userData.first_name ||
        userData.name ||
        (typeof userData.email === "string" ? userData.email.split("@")[0] : "ผู้ใช้งาน");

      const finalUser = {
        ...userData,
        first_name: userData.first_name || fallbackName,
        name: userData.name || fallbackName,
        role: userData.role || "buyer",
      };

      localStorage.setItem("user", JSON.stringify(finalUser));

      // 5. ซิงค์ตะกร้าสินค้าจากฐานข้อมูล
      setStatusText("กำลังซิงค์ข้อมูลตะกร้าสินค้า...");
      await fetchCartFromDB();

      // 6. พาเข้าสู่หน้าหลัก (หรือหน้าผู้ขาย)
      if (finalUser.role === "seller" || finalUser.role === "admin") {
        window.location.href = "/seller";
      } else {
        window.location.href = "/";
      }
    };

    void handleCallback();
  }, [fetchCartFromDB, router]);

  return (
    <div className="min-h-screen bg-[#1B4D3E] flex items-center justify-center font-sans px-4">
      <div className="bg-white p-8 rounded-sm shadow-xl max-w-sm w-full text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-lg font-bold text-gray-900">{statusText}</h2>
        <p className="text-xs text-gray-500">กรุณารอสักครู่ ระบบกำลังพาท่านเข้าสู่หน้าเว็บไซต์</p>
      </div>
    </div>
  );
}