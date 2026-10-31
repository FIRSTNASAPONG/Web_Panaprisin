"use client";

import type { ApiCart } from "@/types/api";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';

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
  cartLoading: boolean;
  cartError: string;
  cartBusy: boolean;
  addToCart: (newItem: CartItem) => Promise<boolean>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => void;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  fetchCartFromDB: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');
  const [cartBusy, setCartBusy] = useState(false);
  const mutation = useRef(false);
  const fetchId = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  // 1. ฟังก์ชันดึงตะกร้าจาก Database (GET /api/cart)
  const fetchCartFromDB = useCallback(async () => {
    const requestId = ++fetchId.current;
    setCartLoading(true); setCartError('');
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
      setIsLoaded(true); setCartLoading(false);
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

      if (!res.ok) throw new Error(res.status === 401 ? 'กรุณาเข้าสู่ระบบใหม่' : 'โหลดตะกร้าไม่สำเร็จ กรุณาลองอีกครั้ง');
      if (requestId !== fetchId.current || token !== localStorage.getItem('token')) return;
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
      if (requestId === fetchId.current) setCartError(error instanceof Error ? error.message : 'โหลดตะกร้าไม่สำเร็จ');
    } finally {
      if (requestId === fetchId.current) { setIsLoaded(true); setCartLoading(false); }
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

  // Authenticated mutations only update the UI after the server accepts them.
  const mutateItem = async (id: number, quantity?: number) => {
    if (mutation.current) return;
    const token = localStorage.getItem('token');
    const item = cart.find(value => value.id === id);
    if (!token) {
      setCart(previous => quantity === undefined ? previous.filter(value => value.id !== id)
        : previous.map(value => value.id === id ? { ...value, quantity } : value));
      return;
    }
    if (!item?.cart_item_id) { setCartError('กรุณาโหลดตะกร้าอีกครั้ง'); return; }
    mutation.current = true; setCartBusy(true); setCartError('');
    try {
      const response = await fetch(`${apiUrl}/cart/${item.cart_item_id}`, {
        method: quantity === undefined ? 'DELETE' : 'PUT',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        ...(quantity === undefined ? {} : { body: JSON.stringify({ quantity }) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'บันทึกตะกร้าไม่สำเร็จ กรุณาลองอีกครั้ง');
      }
      await fetchCartFromDB();
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์');
    } finally { mutation.current = false; setCartBusy(false); }
  };
  const updateQuantity = (id: number, quantity: number) => mutateItem(id, Math.max(1, quantity));
  const removeFromCart = (id: number) => mutateItem(id);

  // 5. ล้างตะกร้าหน้าบ้าน
  const clearCart = () => {
    ++fetchId.current; setCartError(''); setCartLoading(false);
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{ cart, cartLoading, cartError, cartBusy, addToCart, removeFromCart, clearCart, updateQuantity, fetchCartFromDB }}>
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