<?php

namespace App\Http\Controllers;

use App\Models\{Product, Review, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function store(Request $request, int $productId)
    {
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:3000',
            'status' => 'prohibited', 'user_id' => 'prohibited', 'product_id' => 'prohibited',
        ]);
        $user = $request->user();
        abort_unless($user->role === 'buyer', 403);
        $product = Product::findOrFail($productId);
        abort_if((int) $product->user_id === (int) $user->id, 403);

        return DB::transaction(function () use ($user, $productId, $data) {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            abort_unless($user->orders()->where('order_status', 'completed')
                ->whereHas('payment', fn ($q) => $q->where('payment_status', 'completed')
                    ->whereColumn('payments.amount', 'orders.total_amount')->whereNotNull('paid_at'))
                ->whereHas('items', fn ($q) => $q->where('product_id', $productId))->exists(),
                403, 'รีวิวได้หลังซื้อ ชำระเงิน และคำสั่งซื้อสำเร็จแล้วเท่านั้น');
            abort_if(Review::where('user_id', $user->id)->where('product_id', $productId)->exists(), 409, 'คุณรีวิวสินค้านี้แล้ว');
            $review = Review::create($data + ['product_id' => $productId, 'user_id' => $user->id, 'status' => 'pending']);
            return response()->json(['message' => 'ส่งรีวิวสำเร็จ รอผู้ดูแลระบบอนุมัติ', 'review' => $review], 201);
        });
    }

    public function index(int $productId)
    {
        Product::findOrFail($productId);
        return response()->json(Review::published()->with('user:id,first_name,avatar')
            ->where('product_id', $productId)->latest('id')->get());
    }
}
