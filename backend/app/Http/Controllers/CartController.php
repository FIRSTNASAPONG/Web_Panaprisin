<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1|max:100',
        ]);
        if ($request->user()->role !== 'buyer') {
            return response()->json([
                'message' => 'เฉพาะผู้ซื้อเท่านั้นที่เพิ่มสินค้าได้'
            ], 403);
        }
        return DB::transaction(function () use ($request, $data) {
            $cart = Cart::firstOrCreate([
                'user_id' => $request->user()->id
            ]);
            $cart = Cart::whereKey($cart->id)
                ->lockForUpdate()
                ->firstOrFail();
            $product = Product::whereKey($data['product_id'])
                ->lockForUpdate()
                ->firstOrFail();
            $item = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->first();
            abort_unless($product->is_active, 422, 'สินค้านี้ไม่เปิดขายแล้ว');
            $newQuantity = ($item?->quantity ?? 0)
                + $data['quantity'];
            if ($newQuantity > $product->stock_quantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'จำนวนสินค้าเกินสต็อกที่มี'
                ]);
            }
            if ($item) {
                $item->update(['quantity' => $newQuantity]);
            } else {
                $item = CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => $newQuantity,
                ]);
            }
            return response()->json([
                'message' => 'เพิ่มสินค้าสำเร็จ',
                'item' => $item
            ], 201);
        }, 3);
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

        if (!$cartItem->product?->is_active || $request->integer('quantity') > $cartItem->product->stock_quantity) {
            throw ValidationException::withMessages(['quantity' => 'สินค้าไม่พร้อมขายหรือสต็อกไม่เพียงพอ']);
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
