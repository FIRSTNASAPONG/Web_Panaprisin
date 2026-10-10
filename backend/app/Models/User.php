<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; 

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; 

    

    protected $fillable = [
        'name',          // อาจเก็บชื่อ-นามสกุลรวมกัน (ถ้าจำเป็นต้องใช้คู่กับ name เดิม)
        'first_name',    
        'last_name',     
        'email',
        'password',
        'phone',
        'address',
        'role',
        'google_id',     // รองรับ Google Login (ID ที่ Google ส่งมา)
        'avatar',        // รูประโปรไฟล์จาก Google
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google_id',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function cart() { return $this->hasOne(Cart::class); }
    public function orders() { return $this->hasMany(Order::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function products()
    {
        // User คนนี้ มีสินค้าอะไรบ้างที่ตัวเองลงขาย
        return $this->hasMany(Product::class);
    }
}