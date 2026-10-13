<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            // เปลี่ยนมาใช้ first_name และ last_name ตาม Migration ใหม่
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            
            // เพิ่มข้อมูลที่จำเป็นตามโครงสร้างใหม่
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'role' => fake()->randomElement(['customer', 'seller', 'admin']),
            
            // หมายเหตุ: ตัด email_verified_at และ remember_token ออกเพราะไม่มีในตารางแล้ว
        ];
    }
}