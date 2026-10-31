<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::withRatings()->where('is_active', true)->get());
    }

    public function mine(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['seller', 'admin'], true), 403);
        $query = Product::where('is_active', true)->where('user_id', $request->user()->id);
        return response()->json($query->latest('id')->get());
    }

    private function validateProduct(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes|required' : 'required';
        return $request->validate([
            'name' => "$required|string|max:255",
            'description' => 'nullable|string|max:10000',
            'price' => "$required|numeric|min:0|max:99999999.99|decimal:0,2",
            'category_id' => "$required|integer|exists:categories,id",
            'stock_quantity' => "$required|integer|min:0|max:1000000",
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'user_id' => 'prohibited',
        ]);
    }

    private function authorizeProduct(Request $request, Product $product): void
    {
        abort_unless(($request->user()->role === 'admin' && $request->is('api/admin/*')) ||
            (in_array($request->user()->role, ['seller', 'admin'], true) && (int) $product->user_id === (int) $request->user()->id), 403);
    }

    public function store(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['seller', 'admin'], true), 403);
        $data = $this->validateProduct($request);
        unset($data['image']);
        $data['user_id'] = $request->user()->id;
        if ($request->hasFile('image')) {
            $data['image_url'] = $request->file('image')->store('products/seller_'.$request->user()->id, 'public');
        }
        return response()->json(['message' => 'เพิ่มสินค้าสำเร็จ', 'product' => Product::create($data)], 201);
    }

    public function update(Request $request, int $id)
    {
        $product = Product::where('is_active', true)->findOrFail($id);
        $this->authorizeProduct($request, $product);
        $data = $this->validateProduct($request, true);
        unset($data['image']);
        if ($request->hasFile('image')) {
            $data['image_url'] = $request->file('image')->store('products/seller_'.$product->user_id, 'public');
        }
        return DB::transaction(function () use ($product, $data) {
            $locked = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            abort_unless($locked->is_active, 404);
            // Preserve legacy line names before the first product rename after this upgrade.
            \App\Models\OrderItem::where('product_id', $locked->id)->whereNull('product_name')
                ->update(['product_name' => $locked->name]);
            $locked->update($data);
            return response()->json(['message' => 'บันทึกสินค้าสำเร็จ', 'product' => $locked]);
        });
    }

    public function show(int $id)
    {
        return response()->json(Product::withRatings()->where('is_active', true)->findOrFail($id));
    }

    public function destroy(int $id, Request $request)
    {
        // Archive instead of cascading deletion of historical order lines.
        return DB::transaction(function () use ($id, $request) {
            $product = Product::whereKey($id)->lockForUpdate()->firstOrFail();
            $this->authorizeProduct($request, $product);
            $product->update(['is_active' => false]);
            return response()->json(['message' => 'นำสินค้าออกจากหน้าร้านแล้ว ประวัติคำสั่งซื้อยังคงอยู่']);
        });
    }
}
