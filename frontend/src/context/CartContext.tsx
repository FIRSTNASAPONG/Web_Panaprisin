"use client";

import type { ApiCart } from "@/types/api";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

export interface CartItem {
  id: number;            // คือ product_id
  cart_item_id?: number; // เก็บ id ของตาราง cart_items เอาไว้ส่งให้ Backend ตอนแก้จำนวน/ลบ
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (newItem: CartItem) => Promise<boolean>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => void;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  fetchCartFromDB: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  // 1. ฟังก์ชันดึงตะกร้าจาก Database (GET /api/cart)
  const fetchCartFromDB = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch {
          setCart([]);
        }
      }
      setIsLoaded(true);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/cart`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const data: ApiCart = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        const mappedCart: CartItem[] = items.map((item) => ({
          id: Number(item.product_id),
          cart_item_id: Number(item.id),
          name: item.product?.name || 'ไม่มีชื่อสินค้า',
          price: Number(item.product?.price || 0),
          image: item.product?.image_url || item.product?.image || '',
          quantity: Number(item.quantity || 1),
        }));

        setCart(mappedCart);
        localStorage.setItem('cart', JSON.stringify(mappedCart));
      }
    } catch (error) {
      console.warn('Failed to fetch cart from DB:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchCartFromDB();
  }, [fetchCartFromDB]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // 2. เพิ่มสินค้าลงตะกร้า (POST /api/cart)
  const addToCart = async (newItem: CartItem): Promise<boolean> => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const res = await fetch(`${apiUrl}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: newItem.id,
            quantity: newItem.quantity,
          }),
        });

        if (res.ok) {
          await fetchCartFromDB();
          return true;
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้');
          return false;
        }
      } catch (error) {
        console.warn('Error adding to cart:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        return false;
      }
    }

    // กรณียังไม่ได้ล็อกอิน ให้บวกใน LocalStorage ไปก่อน
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === newItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prevCart, newItem];
    });
    return true;
  };

  // 3. แก้ไขจำนวนสินค้า (PUT /api/cart/{itemId})
  const updateQuantity = async (id: number, quantity: number) => {
    const newQty = Math.max(1, quantity);
    const token = localStorage.getItem('token');
    const targetItem = cart.find((item) => item.id === id);

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );

    if (token && targetItem?.cart_item_id) {
      try {
        const res = await fetch(`${apiUrl}/cart/${targetItem.cart_item_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (err.message) alert(err.message);
          await fetchCartFromDB();
        }
      } catch (error) {
        console.warn('Error updating quantity:', error);
        await fetchCartFromDB();
      }
    }
  };

  // 4. ลบสินค้าออกจากตะกร้า (DELETE /api/cart/{itemId})
  const removeFromCart = async (id: number) => {
    const token = localStorage.getItem('token');
    const targetItem = cart.find((item) => item.id === id);

    setCart((prevCart) => prevCart.filter((item) => item.id !== id));

    if (token && targetItem?.cart_item_id) {
      try {
        await fetch(`${apiUrl}/cart/${targetItem.cart_item_id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.warn('Error removing item:', error);
      }
    }
  };

  // 5. ล้างตะกร้าหน้าบ้าน
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, fetchCartFromDB }}>
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