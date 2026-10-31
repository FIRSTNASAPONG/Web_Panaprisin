<?php
namespace Tests\Feature;

use App\Models\{User, Product, Category, Order, Review};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_admin_endpoints_reject_guests_buyers_and_sellers(): void
    {
        $endpoints = [['GET','/admin/overview'],['GET','/admin/users'],['PATCH','/admin/users/1'],['DELETE','/admin/users/1'],
            ['GET','/admin/products'],['POST','/admin/products'],['PATCH','/admin/products/1'],['DELETE','/admin/products/1'],
            ['GET','/admin/orders'],['PUT','/admin/orders/1/status'],['POST','/admin/orders/1/confirm-payment'],
            ['GET','/admin/reviews'],['PATCH','/admin/reviews/1'],['PUT','/admin/reviews/1/approve']];
        foreach ($endpoints as [$method, $path]) { $this->json($method, '/api'.$path)->assertUnauthorized(); }
        foreach (['buyer','seller'] as $role) {
            Sanctum::actingAs(User::factory()->create(['role' => $role]));
            foreach ($endpoints as [$method, $path]) { $this->json($method, '/api'.$path)->assertForbidden(); }
        }
    }

    public function test_admin_users_products_and_safe_deletion(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create();
        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/overview')->assertJsonPath('users', 2);
        $this->getJson('/api/admin/users')->assertJsonMissingPath('data.0.password');
        $this->patchJson("/api/admin/users/$admin->id", ['role' => 'buyer'])->assertForbidden();
        $this->deleteJson("/api/admin/users/$admin->id")->assertForbidden();
        $this->patchJson("/api/admin/users/$buyer->id", ['role' => 'admin'])->assertUnprocessable();
        $buyer->createToken('test');
        $this->patchJson("/api/admin/users/$buyer->id", ['role' => 'seller', 'first_name' => 'Changed'])->assertOk();
        $this->assertSame(0, $buyer->tokens()->count());
        $this->deleteJson("/api/admin/users/$buyer->id")->assertNoContent();
        $this->deleteJson('/api/admin/users/99999')->assertNotFound();
        $category = Category::create(['name' => 'Test']);
        $id = $this->postJson('/api/admin/products', ['name' => 'Admin product', 'price' => 10, 'stock_quantity' => 2, 'category_id' => $category->id])->assertCreated()->json('product.id');
        $this->patchJson("/api/admin/products/$id", ['name' => 'Updated'])->assertOk();
        $this->getJson('/api/admin/products')->assertJsonPath('data.0.name', 'Updated');
        $this->deleteJson("/api/admin/products/$id")->assertOk();
        $this->assertDatabaseHas('products', ['id' => $id, 'is_active' => false]);
    }

    public function test_payment_state_machine_review_moderation_and_cancellation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create();
        $seller = User::factory()->create(['role' => 'seller']);
        $product = Product::create(['user_id' => $seller->id, 'category_id' => Category::create(['name' => 'Test'])->id, 'name' => 'Test', 'price' => 10, 'stock_quantity' => 2]);
        $order = Order::create(['user_id' => $buyer->id, 'total_amount' => 10, 'shipping_address' => 'Test']);
        $order->items()->create(['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 10, 'subtotal' => 10]);
        $payment = $order->payment()->create(['amount' => 9, 'payment_method' => 'bank_transfer']);
        Sanctum::actingAs($admin);
        $this->putJson("/api/admin/orders/$order->id/status", ['order_status' => 'completed'])->assertUnprocessable();
        $this->postJson("/api/admin/orders/$order->id/confirm-payment", ['confirmed' => true, 'reference' => 'bank receipt'])->assertUnprocessable();
        $payment->update(['amount' => 10]);
        $this->postJson("/api/admin/orders/$order->id/confirm-payment", ['confirmed' => false])->assertUnprocessable();
        $this->postJson("/api/admin/orders/$order->id/confirm-payment", ['confirmed' => true, 'reference' => 'bank receipt'])->assertOk()->assertJsonPath('order_status', 'paid');
        $this->assertDatabaseHas('payments', ['id' => $payment->id, 'verified_by' => $admin->id, 'verification_reference' => 'bank receipt']);
        $this->postJson("/api/admin/orders/$order->id/confirm-payment", ['confirmed' => true, 'reference' => 'bank receipt'])->assertConflict();
        $this->putJson("/api/admin/orders/$order->id/status", ['order_status' => 'cancelled'])->assertUnprocessable();
        $this->putJson("/api/admin/orders/$order->id/status", ['order_status' => 'shipped'])->assertOk();
        $this->putJson("/api/admin/orders/$order->id/status", ['order_status' => 'completed'])->assertOk();
        $this->patchJson("/api/admin/users/$buyer->id", ['role' => 'seller'])->assertConflict();
        $this->deleteJson("/api/admin/users/$seller->id")->assertConflict();
        $this->deleteJson("/api/admin/users/$buyer->id")->assertConflict();
        Sanctum::actingAs($buyer);
        $id = $this->postJson("/api/products/$product->id/reviews", ['rating' => 3])->assertCreated()->json('review.id');
        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/reviews')->assertJsonPath('data.0.status', 'pending');
        $this->patchJson("/api/admin/reviews/$id", ['status' => 'approved'])->assertOk();
        $this->getJson("/api/products/$product->id")->assertJsonPath('reviews_count', 1);
        $this->patchJson("/api/admin/reviews/$id", ['status' => 'rejected'])->assertOk();
        $this->getJson("/api/products/$product->id")->assertJsonPath('average_rating', null);
        $this->putJson('/api/admin/reviews/99999/approve')->assertNotFound();
        $fake = Review::create(['user_id' => $seller->id, 'product_id' => $product->id, 'rating' => 5]);
        $this->putJson("/api/admin/reviews/$fake->id/approve")->assertUnprocessable();
        $pending = Order::create(['user_id' => $buyer->id, 'total_amount' => 20, 'shipping_address' => 'Test']);
        $pending->items()->create(['product_id' => $product->id, 'quantity' => 2, 'unit_price' => 10, 'subtotal' => 20]);
        $pending->payment()->create(['amount' => 20, 'payment_method' => 'bank_transfer']);
        $this->putJson("/api/admin/orders/$pending->id/status", ['order_status' => 'cancelled'])->assertOk();
        $this->putJson("/api/admin/orders/$pending->id/status", ['order_status' => 'cancelled'])->assertOk();
        $this->assertSame(4, $product->fresh()->stock_quantity);
        $this->assertSame('failed', $pending->payment->payment_status);
    }
}
