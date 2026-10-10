<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    // อนุญาตให้บันทึกข้อมูลได้ทุกฟิลด์
    protected $guarded = [];

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