<?php

namespace Tests\Feature;

use App\Models\{Cart, Category, Order, Product, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BuyerCommerceTest extends TestCase
{
    use RefreshDatabase;

    private function basket(int $stock = 3): array
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::create(['name' => 'Test category']);
        $product = Product::create(['user_id' => $seller->id, 'category_id' => $category->id,
            'name' => 'Original name', 'price' => '12.50', 'stock_quantity' => $stock]);
        $cart = Cart::create(['user_id' => $buyer->id]);
        $cart->items()->create(['product_id' => $product->id, 'quantity' => 2]);
        return [$buyer, $product, $cart, $seller];
    }

    private function payload(): array
    {
        return ['shipping_address' => 'Test delivery address', 'payment_method' => 'bank_transfer', 'idempotency_key' => (string) Str::uuid()];
    }

    public function test_auth_guard_and_login(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
        $this->getJson('/api/me/orders')->assertUnauthorized();
        $this->getJson('/api/me/orders/1')->assertUnauthorized();
        $this->patchJson('/api/user', [])->assertUnauthorized();
        $buyer = User::factory()->create();
        $this->postJson('/api/login', ['email' => $buyer->email, 'password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/login', ['email' => $buyer->email, 'password' => 'password'])
            ->assertOk()->assertJsonStructure(['access_token', 'user'])->assertJsonMissingPath('user.password');
    }

    public function test_checkout_replay_ownership_snapshot_and_pending_payment(): void
    {
        [$buyer, $product, $cart] = $this->basket();
        Sanctum::actingAs($buyer);
        $payload = $this->payload();
        $id = $this->postJson('/api/checkout', $payload + ['payment_status' => 'completed', 'total_amount' => 1])
            ->assertCreated()->assertJsonPath('payment_status', 'pending')->assertJsonPath('total_amount', '25.00')->json('order_id');
        $this->postJson('/api/checkout', $payload)->assertOk()->assertJsonPath('order_id', $id);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('payments', 1);
        $this->assertSame(1, $product->fresh()->stock_quantity);
        $this->assertSame(0, $cart->items()->count());
        $product->update(['name' => 'Renamed']);
        $this->getJson("/api/me/orders/$id")->assertOk()->assertJsonPath('items.0.product_name', 'Original name')->assertJsonPath('payment.payment_status', 'pending')->assertJsonMissingPath('idempotency_key');
        $this->getJson('/api/me/orders')->assertOk()->assertJsonPath('total', 1)->assertJsonPath('data.0.id', $id);
        $this->getJson('/api/me')->assertOk()->assertJsonPath('total_orders', 1)->assertJsonPath('pending_payment', 1);
        $this->putJson("/api/orders/$id/status", ['order_status' => 'paid'])->assertForbidden();
        $this->getJson('/api/orders')->assertForbidden();
        $this->postJson('/api/checkout', array_replace($payload, ['shipping_address' => 'different']))->assertConflict();
        Sanctum::actingAs(User::factory()->create());
        $this->getJson("/api/me/orders/$id")->assertNotFound();
        $this->getJson('/api/me/orders')->assertJsonPath('total', 0);
        $this->getJson('/api/me')->assertJsonPath('total_orders', 0);
    }

    public function test_insufficient_stock_rolls_back_and_retains_cart(): void
    {
        [$buyer, $product, $cart] = $this->basket(1);
        Sanctum::actingAs($buyer);
        $this->postJson('/api/checkout', $this->payload())->assertUnprocessable()->assertJsonValidationErrors('cart');
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('payments', 0);
        $this->assertSame(1, $product->fresh()->stock_quantity);
        $this->assertSame(1, $cart->items()->count());
    }

    public function test_profile_whitelist_and_validation(): void
    {
        $buyer = User::factory()->create();
        Sanctum::actingAs($buyer);
        $this->patchJson('/api/user', ['first_name' => 'Updated', 'phone' => '0812345678', 'address' => 'New address'])
            ->assertOk()->assertJsonPath('first_name', 'Updated')->assertJsonMissingPath('password');
        $this->patchJson('/api/user', ['role' => 'admin'])->assertUnprocessable();
        $this->patchJson('/api/user', ['password' => 'newpassword'])->assertUnprocessable();
        $this->patchJson('/api/user', ['email' => 'other@example.test'])->assertUnprocessable();
        $this->patchJson('/api/user', ['first_name' => '', 'phone' => 'invalid'])->assertUnprocessable()->assertJsonValidationErrors(['first_name', 'phone']);
        $this->assertSame('buyer', $buyer->fresh()->role);
    }

    public function test_seller_admin_contract_and_buyer_pagination(): void
    {
        [$buyer, $product, $cart, $seller] = $this->basket();
        Sanctum::actingAs($buyer);
        $id = $this->postJson('/api/checkout', $this->payload())->assertCreated()->json('order_id');
        for ($i = 0; $i < 11; $i++) {
            Order::create(['user_id' => $buyer->id, 'total_amount' => 1, 'shipping_address' => 'Test']);
        }
        $this->getJson('/api/me/orders')->assertJsonCount(10, 'data')->assertJsonPath('total', 12);
        $this->getJson('/api/me/orders?page=2')->assertJsonCount(2, 'data');
        Sanctum::actingAs($seller);
        $this->getJson('/api/me')->assertForbidden();
        $this->getJson('/api/orders')->assertOk()->assertJsonPath('data.0.status', 'pending')->assertJsonPath('data.0.items.0.name', $product->name);
        $this->putJson("/api/orders/$id/status", ['order_status' => 'shipped'])->assertForbidden();
        $this->postJson('/api/checkout', $this->payload())->assertForbidden();
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->getJson('/api/orders')->assertOk();
        $this->putJson("/api/orders/$id/status", ['order_status' => 'shipped'])->assertOk();
        Sanctum::actingAs($buyer);
        $this->getJson('/api/me')->assertJsonPath('shipping_orders', 1);
    }

    public function test_checkout_validation_and_empty_cart(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->postJson('/api/checkout', [])->assertUnprocessable()->assertJsonValidationErrors(['shipping_address', 'payment_method', 'idempotency_key']);
        $this->postJson('/api/checkout', $this->payload())->assertUnprocessable();
    }
}
