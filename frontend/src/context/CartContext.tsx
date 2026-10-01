"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (newItem: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // โหลดข้อมูลจาก LocalStorage ตอนเปิดเว็บ
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // เซฟข้อมูลลง LocalStorage อัตโนมัติทุกครั้งที่ตะกร้าเปลี่ยน
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

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
    alert(`เพิ่ม ${newItem.name} ลงตะกร้าแล้ว!`);
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}