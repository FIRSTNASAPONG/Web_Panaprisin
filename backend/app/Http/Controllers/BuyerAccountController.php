<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BuyerAccountController extends Controller
{
    public function overview(Request $request)
    {
        abort_unless($request->user()->role === 'buyer', 403);
        $orders = $request->user()->orders();

        return response()->json([
            'user' => $request->user(),
            'total_orders' => (clone $orders)->count(),
            'pending_payment' => (clone $orders)->where('order_status', '!=', 'cancelled')
                ->whereHas('payment', fn ($query) => $query->where('payment_status', 'pending'))->count(),
            'shipping_orders' => (clone $orders)->where('order_status', 'shipped')->count(),
            'recent_orders' => $orders->with('payment')->latest('id')->limit(5)->get(),
        ])->header('Cache-Control', 'no-store');
    }

    public function orders(Request $request)
    {
        abort_unless($request->user()->role === 'buyer', 403);
        return response()->json($request->user()->orders()->with('payment')->latest('id')->paginate(10))
            ->header('Cache-Control', 'no-store');
    }

    public function order(Request $request, int $id)
    {
        abort_unless($request->user()->role === 'buyer', 403);
        // Scope before lookup: an unrelated ID is indistinguishable from a missing order.
        return response()->json($request->user()->orders()->with(['items.product', 'payment'])->findOrFail($id))
            ->header('Cache-Control', 'no-store');
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+() .-]+$/'],
            'address' => 'nullable|string|max:2000',
            'role' => 'prohibited',
            'email' => 'prohibited',
            'password' => 'prohibited',
            'google_id' => 'prohibited',
        ]);
        $request->user()->update($validated);
        return response()->json($request->user()->fresh())->header('Cache-Control', 'no-store');
    }
}
