<?php

namespace App\Http\Controllers;

use App\Models\{User, Product, Review, Order};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function overview()
    {
        return response()->json(['users' => User::count(), 'products' => Product::count(),
            'orders' => Order::count(), 'pending_reviews' => Review::where('status', 'pending')->count()]);
    }

    public function users() { return response()->json(User::latest('id')->paginate(20)); }
    public function products() { return response()->json(Product::with('seller:id,first_name')->latest('id')->paginate(20)); }
    public function reviews() { return response()->json(Review::with(['user:id,first_name', 'product:id,name'])->latest('id')->paginate(20)); }

    public function updateUser(Request $request, int $id)
    {
        $data = $request->validate(['first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255', 'role' => 'sometimes|required|in:buyer,seller',
            'email' => 'prohibited', 'password' => 'prohibited']);
        return DB::transaction(function () use ($request, $id, $data) {
            $user = User::whereKey($id)->lockForUpdate()->firstOrFail();
            if (array_key_exists('role', $data)) {
                abort_if($request->user()->id === $user->id || $user->role === 'admin', 403, 'ไม่อนุญาตให้เปลี่ยน Role ของตนเองหรือ Admin');
                abort_if($user->products()->exists() || $user->orders()->exists(), 409, 'บัญชีมีประวัติซื้อขาย ไม่สามารถเปลี่ยน Role ได้');
                if ($user->role !== $data['role']) { $user->tokens()->delete(); }
            }
            $user->update($data);
            return response()->json($user);
        });
    }

    public function destroyUser(Request $request, int $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $user = User::whereKey($id)->lockForUpdate()->firstOrFail();
            abort_if($request->user()->id === $user->id || $user->role === 'admin', 403, 'ไม่อนุญาตให้ลบบัญชี Admin');
            abort_if($user->orders()->exists() || $user->products()->exists() || $user->reviews()->exists(), 409, 'บัญชีมีประวัติธุรกรรม จึงไม่สามารถลบได้');
            $user->tokens()->delete();
            $user->delete();
            return response()->noContent();
        });
    }

    public function moderateReview(Request $request, int $id)
    {
        $data = $request->validate(['status' => 'required|in:approved,rejected']);
        $review = Review::findOrFail($id);
        if ($data['status'] === 'approved') {
            abort_unless(Review::verified()->whereKey($id)->exists(), 422, 'รีวิวไม่มีหลักฐานการซื้อที่สำเร็จ');
        }
        $review->update($data);
        return response()->json($review);
    }

    public function approveReview(Request $request, int $id)
    {
        $request->merge(['status' => 'approved']);
        return $this->moderateReview($request, $id);
    }

    public function confirmPayment(Request $request, int $id)
    {
        $data = $request->validate(['confirmed' => 'required|accepted', 'reference' => 'required|string|max:255']);
        return DB::transaction(function () use ($request, $id, $data) {
            $order = Order::whereKey($id)->lockForUpdate()->firstOrFail();
            $payment = $order->payment()->lockForUpdate()->firstOrFail();
            abort_unless($order->order_status === 'pending' && $payment->payment_status === 'pending', 409, 'คำสั่งซื้อนี้ไม่อยู่ระหว่างรอชำระ');
            abort_unless(bccomp((string) $order->total_amount, (string) $payment->amount, 2) === 0, 422, 'ยอดชำระไม่ตรงกับคำสั่งซื้อ');
            $payment->update(['payment_status' => 'completed', 'paid_at' => now(), 'verified_by' => $request->user()->id, 'verification_reference' => $data['reference']]);
            $order->update(['order_status' => 'paid']);
            return response()->json($order->load('payment'));
        });
    }
}
