<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Middleware\IsAdmin;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\CartController;


// ไม่ต้อง Login ก็เข้าได้
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'callback']);
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']); // ดูรีวิว

// ต้อง Login ก่อนถึงจะเข้าได้
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user(); // เช็คข้อมูล user ปัจจุบัน (Frontend)
    });
    //products
    Route::post('/products', [ProductController::class, 'store']);
    //cart
    Route::get('/cart', [CartController::class, 'getCart']);           // ดึงตะกร้า
    Route::post('/cart', [CartController::class, 'addToCart']);        // หยิบใส่ตะกร้า
    Route::put('/cart/{itemId}', [CartController::class, 'updateQuantity']); // แก้ไขจำนวน
    Route::delete('/cart/{itemId}', [CartController::class, 'removeItem']);  // ลบทิ้ง

    // Checkout สั่งซื้อ
    Route::post('/checkout', [OrderController::class, 'checkout']);
    
    // ลูกค้าส่งรีวิว
    Route::post('/products/{productId}/reviews', [ReviewController::class, 'store']);
    // แอดมิน และ ผู้ขาย สามารถดูรายงานยอดขายได้ (ไปแยกสิทธิ์กันข้างใน Controller)
    Route::get('/reports/sales', [ReportController::class, 'salesSummary']);
    
});

Route::middleware(['auth:sanctum', IsAdmin::class])->group(function () {
    Route::post('/products', [ProductController::class, 'store']); // แอดมินเพิ่มสินค้า
    Route::delete('/products/{id}', [ProductController::class, 'destroy']); // แอดมินลบสินค้า
    // แอดมินอนุมัติรีวิว
    Route::put('/admin/reviews/{id}/approve', function ($id) {
        App\Models\Review::where('id', $id)->update(['status' => 'approved']);
        return response()->json(['message' => 'อนุมัติรีวิวสำเร็จ']);
    });
    //ดึงusersทั้งหมด
    Route::get('/admin/users', function () {
        return response()->json(App\Models\User::all());
    });
    // ลบผูuser
    Route::delete('/admin/users/{id}', function ($id) {
        App\Models\User::destroy($id);
        return response()->json(['message' => 'ลบผู้ใช้งานสำเร็จ']);
    });
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
