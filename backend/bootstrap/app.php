<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // เพิ่มส่วนนี้เพื่อจัดการ CORS แบบง่ายๆ
        $middleware->validateCsrfTokens(except: [
            '*', // ถ้าทำ API เป็นหลัก ยกเว้น CSRF ไปเลยก็ได้ครับ (Sanctum จัดการ Token แทน)
        ]);

        // ถ้าคุณมี URL ของ Frontend (เช่น http://localhost:3000)
        // คุณสามารถตั้งค่า Statefule Domains สำหรับ Sanctum ได้ตรงนี้
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
