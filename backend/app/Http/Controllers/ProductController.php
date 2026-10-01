<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    // ดึงสินค้าทั้งหมด
    public function index() {
        return response()->json(Product::all());
    }

    // เพิ่มสินค้า
    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric'
        ]);

        $product = Product::create([
            'name' => $request->name,
            'price' => $request->price,
            'image' => 'image_289eb4.jpg' 
        ]);

        return response()->json(['message' => 'เพิ่มสินค้าสำเร็จ', 'product' => $product]);
    }

    public function show($id) {
    $product = Product::find($id);
    if ($product) {
        return response()->json($product);
    }
    return response()->json(['message' => 'ไม่พบสินค้า'], 404);
}
}