<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect()
    {
        // These routes use the web middleware: Socialite verifies session-bound state.
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $frontend = rtrim(config('services.google.frontend_url'), '/');
        try {
            $google = Socialite::driver('google')->user();
            $raw = $google->getRaw();
            $verified = $raw['email_verified'] ?? $raw['verified_email'] ?? false;
            if (!in_array($verified, [true, 'true', 1, '1'], true) || !$google->getId()
                || !filter_var($google->getEmail(), FILTER_VALIDATE_EMAIL)) {
                throw new \RuntimeException('Unverified Google identity');
            }
            $token = DB::transaction(function () use ($google, $raw) {
                $email = strtolower($google->getEmail());
                $googleId = (string) $google->getId();
                $user = User::where('google_id', $googleId)->lockForUpdate()->first();
                if (!$user) {
                    $user = User::whereRaw('LOWER(email) = ?', [$email])->lockForUpdate()->first();
                    if ($user && $user->google_id && $user->google_id !== $googleId) {
                        throw new \RuntimeException('Google identity mismatch');
                    }
                }
                if (!$user) {
                    $parts = explode(' ', trim((string) $google->getName()), 2);
                    $user = User::create([
                        'email' => $email, 'first_name' => $raw['given_name'] ?? ($parts[0] ?: 'ผู้ใช้งาน'),
                        'last_name' => $raw['family_name'] ?? ($parts[1] ?? ''),
                        'password' => Str::random(64), 'role' => 'buyer', 'google_id' => $googleId,
                        'avatar' => $google->getAvatar(),
                    ]);
                } elseif (!$user->google_id) {
                    // Link only a verified email. Never replace a local password, role or profile.
                    $user->update(['google_id' => $googleId]);
                }
                return $user->createToken('auth_token')->plainTextToken;
            });
            // Fragments are not sent in HTTP requests/referrers; frontend immediately scrubs it.
            return redirect()->away($frontend.'/auth/callback#token='.rawurlencode($token))
                ->header('Cache-Control', 'no-store')->header('Referrer-Policy', 'no-referrer');
        } catch (\Throwable $error) {
            return redirect()->away($frontend.'/login?error=GoogleLoginFailed')
                ->header('Cache-Control', 'no-store')->header('Referrer-Policy', 'no-referrer');
        }
    }
}
