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
    public function store(Request $request)
    {
        // 1. ตรวจสอบข้อมูล (Validation) ป้องกันแฮกเกอร์อัปไฟล์แปลกปลอม
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:categories,id',
            'stock_quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', // รับเฉพาะไฟล์รูป ขนาดไม่เกิน 2MB
        ]);

        $imagePath = null;
        $user = $request->user(); // ดึงข้อมูล Seller ที่กำลังล็อกอิน

        // 2. ถ้า Seller มีการอัปโหลดไฟล์รูปมาด้วย
        if ($request->hasFile('image')) {
            // ทริค: สร้างโฟลเดอร์แยกตาม ID คนขาย เช่น products/seller_5
            $folderName = 'products/seller_' . $user->id;
            
            // เซฟไฟล์ลงโฟลเดอร์ public และเก็บที่อยู่ไฟล์ (Path) ไว้
            $imagePath = $request->file('image')->store($folderName, 'public');
        }

        // 3. บันทึกข้อมูลลงฐานข้อมูล
        $product = Product::create([
            'user_id' => $user->id, // บังคับเซ็ตเจ้าของเป็นคนที่กำลังล็อกอิน
            'category_id' => $request->category_id,
            'name' => $request->name,
            'price' => $request->price,
            'stock_quantity' => $request->stock_quantity,
            'image_url' => $imagePath, // บันทึก Path ของรูปลง Database
        ]);

        return response()->json([
            'message' => 'เพิ่มสินค้าพร้อมรูปภาพสำเร็จ', 
            'product' => $product
        ], 201);
    }

    public function show($id) {
        $product = Product::find($id);
        if ($product) {
            return response()->json($product);
        }
        return response()->json(['message' => 'ไม่พบสินค้า'], 404);
    }

    public function destroy($id, Request $request)
    {
        // 1. หาข้อมูลสินค้าขึ้นมาก่อน
        $product = Product::findOrFail($id);

        // 2. ดึงข้อมูลคนที่กำลังล็อกอินอยู่
        $user = $request->user();

        // 3. ตรวจสอบสิทธิ์ (Authorization)
        // - ถ้าไม่ใช่ admin และ ไม่ใช่เจ้าของสินค้า -> เตะออก! (403)
        if ($user->role !== 'admin' && $product->user_id !== $user->id) {
            return response()->json(['message' => 'คุณไม่มีสิทธิ์ลบสินค้าของร้านอื่น!'], 403);
        }

        // 4. ถ้าผ่านด่านมาได้ (เป็นแอดมิน หรือ เป็นเจ้าของจริงๆ) ก็สั่งลบได้เลย
        $product->delete();

        return response()->json(['message' => 'ลบสินค้าสำเร็จ']);
    }
}