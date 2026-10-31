<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function salesSummary(Request $request)
    {
        $user = $request->user();
        abort_unless(in_array($user->role, ['admin', 'seller'], true), 403);
        $data = $request->validate([
            'from' => 'nullable|date_format:Y-m-d',
            'to' => 'nullable|date_format:Y-m-d'.($request->filled('from') ? '|after_or_equal:from' : ''),
        ]);
        $from = empty($data['from']) ? null : CarbonImmutable::parse($data['from'], 'Asia/Bangkok')->startOfDay()->utc();
        $until = empty($data['to']) ? null : CarbonImmutable::parse($data['to'], 'Asia/Bangkok')->addDay()->startOfDay()->utc();
        $items = OrderItem::whereHas('order', function ($orders) use ($from, $until) {
            $orders->whereIn('order_status', ['paid', 'shipped', 'completed'])
                ->whereHas('payment', function ($payments) use ($from, $until) {
                    $payments->where('payment_status', 'completed')->whereNotNull('paid_at')
                        ->whereColumn('payments.amount', 'orders.total_amount')
                        ->when($from, fn ($q) => $q->where('paid_at', '>=', $from))
                        ->when($until, fn ($q) => $q->where('paid_at', '<', $until));
                });
        });
        if ($user->role === 'seller' || !$request->is('api/admin/*')) {
            $items->whereHas('product', fn ($q) => $q->where('user_id', $user->id));
        }
        return response()->json([
            'role_view' => $user->role,
            'total_revenue' => (clone $items)->sum('subtotal'),
            'total_orders' => (clone $items)->distinct()->count('order_id'),
            'top_selling_products' => (clone $items)->select('product_id', DB::raw('SUM(quantity) as total_sold'), DB::raw('SUM(subtotal) as revenue'))
                ->groupBy('product_id')->orderByDesc('total_sold')->orderBy('product_id')->limit(5)
                ->with('product:id,name,price')->get(),
            'from' => $data['from'] ?? null, 'to' => $data['to'] ?? null,
            'timezone' => 'Asia/Bangkok', 'date_basis' => 'paid_at',
        ]);
    }
}
