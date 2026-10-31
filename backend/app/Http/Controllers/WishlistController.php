<?php

namespace App\Http\Controllers;

use App\Models\{Product, WishlistItem};
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(WishlistItem::where('user_id', $request->user()->id)
            ->with('product')->latest('id')->get());
    }

    public function store(Request $request, int $productId)
    {
        Product::where('is_active', true)->findOrFail($productId);
        // createOrFirst handles simultaneous inserts using the database unique constraint.
        $item = WishlistItem::firstOrCreate(['user_id' => $request->user()->id, 'product_id' => $productId]);
        return response()->json($item->load('product'), $item->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, int $productId)
    {
        WishlistItem::where('user_id', $request->user()->id)->where('product_id', $productId)->delete();
        return response()->noContent();
    }
}
