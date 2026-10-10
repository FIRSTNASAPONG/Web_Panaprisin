<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // เติม unique() เข้าไปตรงนี้
            $table->foreignId('order_id')->unique()->constrained('orders')->onDelete('cascade');
            $table->enum('payment_method', ['promptpay', 'credit_card', 'bank_transfer']);
            $table->decimal('amount', 10, 2);
            $table->enum('payment_status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
