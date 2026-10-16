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
            
            // ดึงข้อมูลชื่อดิบจาก Google (Google จะส่ง given_name และ family_name มาให้ด้วย)
            $rawUser = $googleUser->getRaw();
            
            // กรณี Google ส่ง given_name/family_name มา ให้ใช้ค่านั้น 
            // แต่ถ้าไม่มี ให้แยกจาก getName() ด้วยช่องว่าง (explode)
            $fullName = trim($googleUser->getName());
            $nameParts = explode(' ', $fullName, 2);

            $firstName = $rawUser['given_name'] ?? ($nameParts[0] ?? $fullName);
            $lastName  = $rawUser['family_name'] ?? ($nameParts[1] ?? '');

            // ค้นหา User ว่ามีอีเมลนี้ในระบบหรือยัง ถ้ายังให้สร้างใหม่
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'first_name' => $firstName,
                    'last_name'  => $lastName,
                    'google_id'  => $googleUser->getId(),
                    'avatar'     => $googleUser->getAvatar(),
                    // สร้างรหัสผ่านแบบสุ่มให้ไปเลย เพราะเป็นการล็อกอินผ่าน Google
                    'password'   => Hash::make(Str::random(24)), 
                ]
            );

            // ออก Token ด้วย Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;
            
            // เด้งกลับไปที่หน้า Frontend พร้อมแนบ Token และข้อมูล User ไปทาง URL
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            
            $userData = json_encode([
                'id'         => $user->id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'role'       => $user->role ?? 'buyer',
                'avatar'     => $user->avatar,
            ]);
            
            return redirect()->away($frontendUrl . '/auth/callback?token=' . $token . '&user=' . urlencode($userData));

        } catch (\Exception $e) {
            return redirect()->away(env('FRONTEND_URL', 'http://localhost:3000') . '/login?error=GoogleLoginFailed');
        }
    }
}