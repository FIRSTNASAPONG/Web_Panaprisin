<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    // อนุญาตให้บันทึกข้อมูลได้ทุกฟิลด์
    protected $guarded = [];

    public function scopeVerified($query)
    {
        return $query->whereBetween('rating', [1, 5])->whereHas('user.orders', function ($orders) {
            $orders->where('order_status', 'completed')
                ->whereHas('payment', fn ($q) => $q->where('payment_status', 'completed')
                    ->whereColumn('payments.amount', 'orders.total_amount')->whereNotNull('paid_at'))
                ->whereHas('items', fn ($q) => $q->whereColumn('order_items.product_id', 'reviews.product_id'));
        })->whereHas('product', fn ($q) => $q->whereColumn('products.user_id', '!=', 'reviews.user_id'));
    }

    public function scopePublished($query)
    {
        return $query->verified()->where('status', 'approved');
    }

    // ความสัมพันธ์แบบ N:1 -> รีวิวนี้เป็นของผู้ใช้ (User) คนไหน
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ความสัมพันธ์แบบ N:1 -> รีวิวนี้เป็นของสินค้า (Product) ชิ้นไหน
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}