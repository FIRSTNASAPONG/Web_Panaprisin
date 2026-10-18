<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->role, ['seller', 'admin'], true)) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }
        if ($user->role === 'admin') {
            return response()->json(
                Order::with(['user', 'items.product', 'payment'])
                    ->latest()
                    ->paginate(20)
            );
        }
        $orders = Order::query()
            ->whereHas('items.product', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with([
                'items' => function ($query) use ($user) {
                    $query->whereHas('product', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
                },
                'items.product'
            ])
            ->latest()
            ->paginate(20);
        $orders->getCollection()->transform(function ($order) {
            return [
                'id' => $order->id,
                'status' => $order->order_status,
                'created_at' => $order->created_at,
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'name' => $item->product?->name,
                        'quantity' => $item->quantity,
                        'price' => $item->unit_price,
                        'subtotal' => $item->subtotal,
                    ];
                }),
                'total_amount' => $order->items->sum('subtotal')
            ];
        });
        return response()->json($orders);
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'shipping_address' => 'required|string|max:2000',
            'payment_method' => 'required|in:promptpay,bank_transfer',
            'idempotency_key' => 'required|uuid',
        ]);
        if ($request->user()->role !== 'buyer') {
            return response()->json([
                'message' => 'เฉพาะผู้ซื้อเท่านั้นที่สั่งซื้อได้'
            ], 403);
        }
        try {
            return DB::transaction(function () use ($request, $validated) {
                // Serialize all checkouts for this buyer, including retries after cart clearing.
                $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
                $fingerprint = hash('sha256', json_encode([$validated['shipping_address'], $validated['payment_method']]));
                $existing = Order::where('user_id', $request->user()->id)
                    ->where('idempotency_key', $validated['idempotency_key'])->first();
                if ($existing) {
                    abort_if($existing->checkout_fingerprint !== $fingerprint, 409, 'รหัสคำขอนี้ถูกใช้กับข้อมูลอื่นแล้ว');
                    return response()->json(['order_id' => $existing->id, 'order_status' => $existing->order_status,
                        'payment_status' => $existing->payment?->payment_status, 'total_amount' => $existing->total_amount]);
                }
                $cart = Cart::where('user_id', $request->user()->id)
                    ->lockForUpdate()
                    ->first();
                if (!$cart) {
                    return response()->json([
                        'message' => 'ตะกร้าว่างเปล่า'
                    ], 422);
                }
                $items = $cart->items()
                    ->orderBy('product_id')
                    ->get();
                if ($items->isEmpty()) {
                    return response()->json([
                        'message' => 'ตะกร้าว่างเปล่า'
                    ], 422);
                }
                // Lock สินค้าตามลำดับ ID เพื่อช่วยลด Deadlock
                $products = Product::whereIn(
                    'id',
                    $items->pluck('product_id')
                )
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');
                $total = '0.00';
                $lines = [];
                foreach ($items as $item) {
                    $product = $products->get($item->product_id);
                    if (!$product || !$product->is_active) {
                        throw ValidationException::withMessages([
                            'cart' => 'มีสินค้าที่ไม่สามารถสั่งซื้อได้'
                        ]);
                    }
                    if (
                        $item->quantity < 1 ||
                        $product->stock_quantity < $item->quantity
                    ) {
                        throw ValidationException::withMessages([
                            'cart' => 'สต็อกสินค้าไม่เพียงพอ: ' .
                                $product->name
                        ]);
                    }
                    // คำนวณเงินจากราคาใน Database เท่านั้น
                    $subtotal = bcmul(
                        (string) $product->price,
                        (string) $item->quantity,
                        2
                    );
                    $total = bcadd($total, $subtotal, 2);
                    $lines[] = [
                        'product' => $product,
                        'quantity' => $item->quantity,
                        'subtotal' => $subtotal,
                    ];
                }
                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'total_amount' => $total,
                    'order_status' => 'pending',
                    'shipping_address' => $validated['shipping_address'],
                    'idempotency_key' => $validated['idempotency_key'],
                    'checkout_fingerprint' => $fingerprint,
                ]);
                foreach ($lines as $line) {
                    $product = $line['product'];
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $line['quantity'],
                        'unit_price' => $product->price,
                        'subtotal' => $line['subtotal'],
                    ]);
                    $product->decrement(
                        'stock_quantity',
                        $line['quantity']
                    );
                }
                Payment::create([
                    'order_id' => $order->id,
                    'payment_method' => $validated['payment_method'],
                    'amount' => $total,
                    'payment_status' => 'pending',
                ]);
                $cart->items()->delete();
                return response()->json([
                    'message' => 'สร้างคำสั่งซื้อสำเร็จ รอชำระเงิน',
                    'order_id' => $order->id,
                    'total_amount' => $total,
                    'order_status' => 'pending',
                    'payment_status' => 'pending',
                ], 201);
            }, 3);
        } catch (ValidationException $e) {
            throw $e;
        }
    }
    public function updateStatus(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }
        $validated = $request->validate([
            'order_status' => 'required|in:pending,paid,shipped,completed,cancelled'
        ]);
        $order = Order::findOrFail($id);
        $order->update([
            'order_status' => $validated['order_status']
        ]);
        return response()->json([
            'message' => 'อัปเดตสถานะคำสั่งซื้อสำเร็จ',
            'order' => $order
        ]);
    }
}
