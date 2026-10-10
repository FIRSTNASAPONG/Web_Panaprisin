<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    // 1. พาผู้ใช้ไปยังหน้า Login ของ Google (ใช้ stateless เพราะเป็น API)
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // 2. รับข้อมูลกลับมาจาก Google
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // ค้นหา User ว่ามีอีเมลนี้ในระบบหรือยัง ถ้ายังให้สร้างใหม่
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    // สร้างรหัสผ่านแบบสุ่มให้ไปเลย เพราะเราไม่ใช้
                    'password' => Hash::make(Str::random(24)), 
                    'first_name' => $googleUser->getName(), // ใส่แก้ขัดไปก่อน
                    'last_name' => ' ',
                ]
            );

            // ออก Token ด้วย Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // เด้งกลับไปที่หน้า Frontend พร้อมแนบ Token ไปทาง URL
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $userData = json_encode(['id' => $user->id, 'name' => $user->name, 'email' => $user->email]);
            
            return redirect()->away($frontendUrl . '/auth/callback?token=' . $token . '&user=' . urlencode($userData));

        } catch (\Exception $e) {
            return redirect()->away(env('FRONTEND_URL') . '/login?error=GoogleLoginFailed');
        }
    }
}