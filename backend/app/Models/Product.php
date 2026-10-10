<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];
    public function category() { return $this->belongsTo(Category::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function seller()
    {
        // สินค้านี้ เป็นของ User (คนขาย) คนไหน
        return $this->belongsTo(User::class, 'user_id');
    }
}
