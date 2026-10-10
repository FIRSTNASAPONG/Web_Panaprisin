<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function checkout(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string',
            'payment_method' => 'required|in:promptpay,credit_card,bank_transfer'
        ]);

        $user = $request->user();
        // โหลดข้อมูลสินค้าในตะกร้า
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // เช็คว่าตะกร้าว่างไหม
        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'ตะกร้าสินค้าว่างเปล่า'], 400);
        }

        // เริ่ม Transaction: ป้องกันข้อมูลพังกลางทาง
        DB::beginTransaction();

        try {
            $totalAmount = 0;

            // 1. สร้างบิลคำสั่งซื้อ (Order)
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => 0, // เดี๋ยวมาบวกทีหลัง
                'order_status' => 'completed',
                'shipping_address' => $request->shipping_address,
            ]);

            // 2. ลูปรายการสินค้าในตะกร้า เพื่อหักสต็อกและบันทึกลง OrderItem
            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;

                // เช็คว่าสต็อกพอไหม
                if ($product->stock_quantity < $cartItem->quantity) {
                    throw new \Exception('สินค้า ' . $product->name . ' มีสต็อกไม่พอ');
                }

                $subtotal = $product->price * $cartItem->quantity;
                $totalAmount += $subtotal;

                // บันทึกรายการสินค้าในบิล
                OrderItem::create([
                    'order_id' => $order->id ?? null,
                    'product_id' => $product->id,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $product->price,
                    'subtotal' => $subtotal
                ]);

                // ตัดสต็อกสินค้า
                $product->decrement('stock_quantity', $cartItem->quantity);
            }

            // อัปเดตยอดรวมกลับไปที่ Order
            $order->update(['total_amount' => $totalAmount]);

            // 3. สร้างข้อมูลรอการชำระเงิน (Payment)
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $request->payment_method,
                'amount' => $totalAmount,
                'payment_status' => 'pending'
            ]);

            // 4. เคลียร์ของในตะกร้าทิ้ง
            $cart->items()->delete();

            // ยืนยันการทำงานทั้งหมด (Commit)
            DB::commit();

            return response()->json(['message' => 'สั่งซื้อสำเร็จ', 'order_id' => $order->id], 201);

        } catch (\Exception $e) {
            // ถ้าระหว่างทำงานมี Error ให้ย้อนข้อมูลกลับทั้งหมด (Rollback) จะได้ไม่มีบิลผี หรือสต็อกหายฟรี
            DB::rollBack();
            return response()->json(['message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()], 400);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['order_status' => 'required|in:pending,paid,shipped,completed,cancelled']);
        
        $order = Order::findOrFail($id);
        
        // (สามารถเขียนเช็คสิทธิ์เพิ่มได้ว่า Seller ควรอัปเดตได้เฉพาะบิลที่มีสินค้าตัวเอง)
        
        $order->update(['order_status' => $request->order_status]);
        return response()->json(['message' => 'อัปเดตสถานะคำสั่งซื้อเป็น ' . $request->order_status]);
    }
}