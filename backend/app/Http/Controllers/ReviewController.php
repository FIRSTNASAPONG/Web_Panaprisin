<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // ลูกค้าส่งรีวิว
    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        $user = $request->user();

        // เช็คว่าเคยรีวิวสินค้านี้ไปหรือยัง (อิงจากที่เราตั้ง unique ใน DB)
        $existingReview = Review::where('user_id', $user->id)
                                ->where('product_id', $productId)
                                ->first();

        if ($existingReview) {
            return response()->json(['message' => 'คุณรีวิวสินค้านี้ไปแล้ว'], 400);
        }

        $review = Review::create([
            'product_id' => $productId,
            'user_id' => $user->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending' // ต้องรอแอดมินอนุมัติก่อนถึงจะโชว์หน้าเว็บ
        ]);

        return response()->json(['message' => 'ส่งรีวิวสำเร็จ รอผู้ดูแลระบบอนุมัติ', 'review' => $review], 201);
    }

    // ดึงรีวิวไปโชว์หน้าเว็บ (เอาเฉพาะที่อนุมัติแล้ว)
    public function index($productId)
    {
        $reviews = Review::with('user:id,first_name,avatar')
                         ->where('product_id', $productId)
                         ->where('status', 'approved')
                         ->get();

        return response()->json($reviews);
    }
}