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
use App\Models\Category;


// ไม่ต้อง Login ก็เข้าได้
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'callback']);
Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']); // ดูรีวิว
Route::get('/categories', function () {
    return response()->json(
        Category::query()
            ->orderBy('id')
            ->get(['id', 'name'])
    );
});

// ต้อง Login ก่อนถึงจะเข้าได้
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user(); // เช็คข้อมูล user ปัจจุบัน (Frontend)
    });
    Route::get('/me', [\App\Http\Controllers\BuyerAccountController::class, 'overview']);
    Route::get('/me/orders', [\App\Http\Controllers\BuyerAccountController::class, 'orders']);
    Route::get('/me/orders/{id}', [\App\Http\Controllers\BuyerAccountController::class, 'order'])->whereNumber('id');
    Route::patch('/user', [\App\Http\Controllers\BuyerAccountController::class, 'updateProfile']);
    Route::get('/wishlist', [\App\Http\Controllers\WishlistController::class, 'index']);
    Route::put('/wishlist/{productId}', [\App\Http\Controllers\WishlistController::class, 'store'])->whereNumber('productId');
    Route::delete('/wishlist/{productId}', [\App\Http\Controllers\WishlistController::class, 'destroy'])->whereNumber('productId');
    //products
    Route::get('/me/products', [ProductController::class, 'mine']);
    Route::match(['put', 'patch'], '/products/{id}', [ProductController::class, 'update'])->whereNumber('id');
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
    //order
    Route::get('/orders', [OrderController::class, 'index']);
    // ลบสินค้า
    Route::delete('/products/{id}', [ProductController::class, 'destroy']); 
});

Route::middleware(['auth:sanctum', IsAdmin::class])->group(function () {
    $admin = \App\Http\Controllers\AdminController::class;
    Route::get('/admin/overview', [$admin, 'overview']);
    Route::get('/admin/users', [$admin, 'users']);
    Route::patch('/admin/users/{id}', [$admin, 'updateUser'])->whereNumber('id');
    Route::delete('/admin/users/{id}', [$admin, 'destroyUser'])->whereNumber('id');
    Route::get('/admin/products', [$admin, 'products']);
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::patch('/admin/products/{id}', [ProductController::class, 'update'])->whereNumber('id');
    Route::delete('/admin/products/{id}', [ProductController::class, 'destroy'])->whereNumber('id');
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus'])->whereNumber('id');
    Route::post('/admin/orders/{id}/confirm-payment', [$admin, 'confirmPayment'])->whereNumber('id');
    Route::get('/admin/reviews', [$admin, 'reviews']);
    Route::patch('/admin/reviews/{id}', [$admin, 'moderateReview'])->whereNumber('id');
    Route::put('/admin/reviews/{id}/approve', [$admin, 'approveReview'])->whereNumber('id');
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus'])->whereNumber('id');
});
