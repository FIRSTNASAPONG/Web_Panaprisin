"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// กำหนดว่าของในตะกร้า 1 ชิ้นมีข้อมูลอะไรบ้าง
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// กำหนดว่าใน Context จะมีคำสั่งอะไรให้ใช้บ้าง
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  cartCount: number; // เอาไว้นับจำนวนรวมทั้งหมด
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ฟังก์ชันเพิ่มของลงตะกร้า
  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      // เช็คว่ามีของชิ้นนี้ในตะกร้าหรือยัง
      const existingItem = prevCart.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // ถ้ามีแล้ว ให้บวกจำนวนเพิ่ม
        return prevCart.map(item => 
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      
      // ถ้ายังไม่มี ให้ใส่ของชิ้นใหม่เข้าไป
      return [...prevCart, newItem];
    });
    
    // แจ้งเตือนเล็กๆ (เดี๋ยวค่อยทำเป็น Popup สวยๆ ทีหลังได้)
    alert(`เพิ่ม ${newItem.name} ลงตะกร้าแล้ว!`);
  };

  // คำนวณจำนวนชิ้นทั้งหมดในตะกร้า
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

// ฟังก์ชันลัดไว้ให้หน้าอื่นๆ เรียกใช้งานตะกร้าได้ง่ายๆ
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}