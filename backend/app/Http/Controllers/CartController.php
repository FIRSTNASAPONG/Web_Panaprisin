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
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
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
    // All mutations share checkout's user -> cart -> product lock order.
    public function updateQuantity(Request $request, int $itemId)
    {
        abort_unless($request->user()->role === 'buyer', 403);
        $data = $request->validate(['quantity' => 'required|integer|min:1|max:1000000']);
        return DB::transaction(function () use ($request, $itemId, $data) {
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $cart = Cart::where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            $item = $cart->items()->findOrFail($itemId);
            $product = Product::whereKey($item->product_id)->lockForUpdate()->firstOrFail();
            if (!$product->is_active || $data['quantity'] > $product->stock_quantity) {
                throw ValidationException::withMessages(['quantity' => 'สินค้าไม่พร้อมขายหรือสต็อกไม่เพียงพอ']);
            }
            $item->update($data);
            return response()->json(['message' => 'อัปเดตจำนวนสำเร็จ']);
        }, 3);
    }

    public function removeItem(Request $request, int $itemId)
    {
        abort_unless($request->user()->role === 'buyer', 403);
        return DB::transaction(function () use ($request, $itemId) {
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $cart = Cart::where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();
            $cart->items()->findOrFail($itemId)->delete();
            return response()->json(['message' => 'ลบสินค้าออกจากตะกร้าสำเร็จ']);
        }, 3);
    }
}
