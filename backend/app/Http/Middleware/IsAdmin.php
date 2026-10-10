<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // เช็คว่าล็อกอินอยู่ไหม และ role เป็น admin หรือเปล่า
        if ($request->user() && $request->user()->role === 'admin') {
            return $next($request); // ให้ผ่านไปทำคำสั่งต่อไปได้
        }

        // ถ้าไม่ใช่ admin ให้เตะออก พร้อมบอกว่าไม่มีสิทธิ์ (403)
        return response()->json(['message' => 'Forbidden. เฉพาะแอดมินเท่านั้น!'], 403);
    }
}