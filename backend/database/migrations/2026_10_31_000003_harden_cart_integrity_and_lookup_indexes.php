<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fail closed: do not silently discard or combine existing cart data.
        if (DB::table('cart_items')->select('cart_id', 'product_id')->groupBy('cart_id', 'product_id')->havingRaw('COUNT(*) > 1')->exists()) {
            throw new RuntimeException('Duplicate cart_items found. Review duplicates before applying this migration. No data was modified.');
        }
        Schema::table('cart_items', fn (Blueprint $table) => $table->unique(['cart_id', 'product_id']));
        Schema::table('orders', fn (Blueprint $table) => $table->index(['user_id', 'created_at']));
        Schema::table('reviews', fn (Blueprint $table) => $table->index(['product_id', 'status']));
        Schema::table('order_items', fn (Blueprint $table) => $table->index(['product_id', 'order_id']));
        Schema::table('wishlist_items', fn (Blueprint $table) => $table->index('product_id'));
    }
    public function down(): void
    {
        Schema::table('cart_items', fn (Blueprint $table) => $table->dropUnique(['cart_id', 'product_id']));
        Schema::table('orders', fn (Blueprint $table) => $table->dropIndex(['user_id', 'created_at']));
        Schema::table('reviews', fn (Blueprint $table) => $table->dropIndex(['product_id', 'status']));
        Schema::table('order_items', fn (Blueprint $table) => $table->dropIndex(['product_id', 'order_id']));
        Schema::table('wishlist_items', fn (Blueprint $table) => $table->dropIndex(['product_id']));
    }
};
