<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Keep existing public URLs while enabling session-bound OAuth state validation.
Route::get('/api/auth/google/redirect', [\App\Http\Controllers\SocialAuthController::class, 'redirect'])->middleware('throttle:20,1');
Route::get('/api/auth/google/callback', [\App\Http\Controllers\SocialAuthController::class, 'callback'])->middleware('throttle:20,1');
