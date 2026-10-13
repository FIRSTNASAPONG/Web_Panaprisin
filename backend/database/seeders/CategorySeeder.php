<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // รายชื่อหมวดหมู่ตามหน้า Frontend
        $categories = [
            ['name' => 'พระเครื่อง'], //
            ['name' => 'รูปปั้นและทองเหลือง'], //[cite: 14]
            ['name' => 'เฟอร์นิเจอร์ไม้เก่า'], //[cite: 14]
            ['name' => 'ของสะสมอื่นๆ'], //[cite: 14]
        ];

        // ใช้ firstOrCreate เพื่อป้องกันการสร้างข้อมูลซ้ำถ้ารัน Seeder หลายรอบ
        foreach ($categories as $category) {
            Category::firstOrCreate($category);
        }
    }
}
