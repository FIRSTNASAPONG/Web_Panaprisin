<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function salesSummary(Request $request)
    {
        $user = $request->user();

        // 🟢 กรณี 1: ถ้าเป็น Admin ให้ดูยอดขายรวม "ทั้งระบบ"
        if ($user->role === 'admin') {
            $totalRevenue = Order::whereIn('order_status', ['paid', 'completed'])->sum('total_amount');
            $totalOrders = Order::whereIn('order_status', ['paid', 'completed'])->count();
            $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
                ->whereHas('order', function($query) {
                    $query->whereIn('order_status', ['paid', 'completed']);
                })
                ->groupBy('product_id')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->with('product:id,name,price')
                ->get();
        } 
        
        // 🟡 กรณี 2: ถ้าเป็น Seller ให้ดูยอดขาย "เฉพาะสินค้าของตัวเอง"
        elseif ($user->role === 'seller') {
            // สร้าง Query ดึงรายการสินค้า (OrderItem) ที่เป็นของคนขายคนนี้ และบิลชำระเงินแล้ว
            $sellerItemsQuery = OrderItem::whereHas('product', function($query) use ($user) {
                    // กรองเอาเฉพาะสินค้าที่ user_id ตรงกับคนขายที่ล็อกอินอยู่
                    $query->where('user_id', $user->id); 
                })
                ->whereHas('order', function($query) {
                    $query->whereIn('order_status', ['paid', 'completed']);
                });

            // 1. ยอดขายรวม (บวกจาก subtotal ของสินค้าร้านตัวเองเท่านั้น)
            $totalRevenue = (clone $sellerItemsQuery)->sum('subtotal');
            
            // 2. จำนวนคำสั่งซื้อ (นับเฉพาะบิลที่มีสินค้าของร้านตัวเอง)
            $totalOrders = (clone $sellerItemsQuery)->distinct('order_id')->count();
            
            // 3. สินค้าขายดี (เฉพาะของร้านตัวเอง)
            $topProducts = (clone $sellerItemsQuery)->select('product_id', DB::raw('SUM(quantity) as total_sold'))
                ->groupBy('product_id')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->with('product:id,name,price')
                ->get();
        } 
        
        // 🔴 กรณี 3: ถ้าเป็น Customer แอบยิง API เข้ามา ให้เตะออก
        else {
            return response()->json(['message' => 'คุณไม่มีสิทธิ์เข้าถึงรายงานนี้'], 403);
        }

        return response()->json([
            'role_view' => $user->role, // ส่งไปบอกหน้าบ้านด้วยว่ากำลังดูในมุมมองใคร
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'top_selling_products' => $topProducts
        ]);
    }
}