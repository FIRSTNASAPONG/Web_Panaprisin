<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->uuid('idempotency_key')->nullable();
            $table->string('checkout_fingerprint', 64)->nullable();
            $table->unique(['user_id', 'idempotency_key']);
        });
        Schema::table('order_items', fn (Blueprint $table) => $table->string('product_name')->nullable());
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'idempotency_key']);
            $table->dropColumn(['idempotency_key', 'checkout_fingerprint']);
        });
        Schema::table('order_items', fn (Blueprint $table) => $table->dropColumn('product_name'));
    }
};
