<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    // 1. ดึงข้อมูลตะกร้าของคนที่ล็อกอินอยู่
    public function getCart(Request $request)
    {
        $user = $request->user();
        
        // ค้นหาตะกร้าของ User นี้ ถ้ายังไม่มีให้สร้างใหม่เลยอัตโนมัติ (firstOrCreate)
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // โหลดข้อมูลสินค้าในตะกร้า พร้อมดึงรายละเอียดสินค้า (Product) มาด้วย
        $cart->load('items.product');

        return response()->json($cart);
    }

    // 2. เพิ่มสินค้าลงตะกร้า
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $user = $request->user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // เช็คว่าสินค้านี้มีในตะกร้าอยู่แล้วหรือเปล่า
        $cartItem = CartItem::where('cart_id', $cart->id)
                            ->where('product_id', $request->product_id)
                            ->first();

        if ($cartItem) {
            // ถ้ามีอยู่แล้ว ให้บวกจำนวนเพิ่ม
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            // ถ้ายังไม่มี ให้สร้างแถวใหม่
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity
            ]);
        }

        return response()->json(['message' => 'เพิ่มสินค้าลงตะกร้าสำเร็จ']);
    }

    // 3. แก้ไขจำนวนสินค้าในตะกร้า (เช่น กดปุ่ม + / -)
    public function updateQuantity(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = CartItem::findOrFail($itemId);
        
        // เช็คความปลอดภัย: ตะกร้านี้เป็นของคนที่ล็อกอินอยู่จริงๆ ใช่ไหม?
        if ($cartItem->cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'ไม่อนุญาต'], 403);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json(['message' => 'อัปเดตจำนวนสำเร็จ']);
    }

    // 4. ลบสินค้าออกจากตะกร้า
    public function removeItem(Request $request, $itemId)
    {
        $cartItem = CartItem::findOrFail($itemId);

        if ($cartItem->cart->user_id !== $request->user()->id) {
            return response()->json(['message' => 'ไม่อนุญาต'], 403);
        }

        $cartItem->delete();

        return response()->json(['message' => 'ลบสินค้าออกจากตะกร้าสำเร็จ']);
    }
}