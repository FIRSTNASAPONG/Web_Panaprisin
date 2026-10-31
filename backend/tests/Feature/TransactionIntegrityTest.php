<?php
namespace Tests\Feature;

use App\Models\{User, Product, Category, Cart};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransactionIntegrityTest extends TestCase
{
    use RefreshDatabase;
    private function basket(string $price = '12.50'): array
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create(['role' => 'seller']);
        $product = Product::create(['user_id' => $seller->id, 'category_id' => Category::create(['name' => 'Test'])->id, 'name' => 'Original', 'price' => $price, 'stock_quantity' => 10]);
        $cart = Cart::create(['user_id' => $buyer->id]);
        $item = $cart->items()->create(['product_id' => $product->id, 'quantity' => 2]);
        return [$buyer, $seller, $product, $item];
    }
    private function payload(): array
    {
        return ['shipping_address' => 'Test', 'payment_method' => 'bank_transfer', 'idempotency_key' => (string) Str::uuid()];
    }
    public function test_money_overflow_is_validation_failure_without_side_effects(): void
    {
        [$buyer, , $product] = $this->basket('99999999.99');
        Sanctum::actingAs($buyer);
        $this->postJson('/api/checkout', $this->payload())->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('payments', 0);
        $this->assertSame(10, $product->fresh()->stock_quantity);
        $this->assertDatabaseCount('cart_items', 1);
    }
    public function test_cart_ownership_and_role_changes_cannot_mutate_other_baskets(): void
    {
        [$buyer, $seller, $product, $item] = $this->basket();
        Sanctum::actingAs(User::factory()->create());
        $this->putJson("/api/cart/$item->id", ['quantity' => 3])->assertNotFound();
        $this->deleteJson("/api/cart/$item->id")->assertNotFound();
        $buyer->update(['role' => 'seller']);
        Sanctum::actingAs($buyer);
        $this->putJson("/api/cart/$item->id", ['quantity' => 3])->assertForbidden();
        $this->deleteJson("/api/cart/$item->id")->assertForbidden();
        $this->assertSame(2, $item->fresh()->quantity);
    }
    public function test_cancel_replay_preserves_new_basket_and_payment_audit_is_admin_only(): void
    {
        [$buyer, $seller, $product] = $this->basket();
        Sanctum::actingAs($buyer);
        $payload = $this->payload();
        $id = $this->postJson('/api/checkout', $payload)->assertCreated()->json('order_id');
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $this->putJson("/api/orders/$id/status", ['order_status' => 'cancelled'])->assertOk();
        $this->putJson("/api/orders/$id/status", ['order_status' => 'cancelled'])->assertOk();
        $this->postJson("/api/admin/orders/$id/confirm-payment", ['confirmed' => true, 'reference' => 'receipt'])->assertConflict();
        $this->assertSame(10, $product->fresh()->stock_quantity);
        Sanctum::actingAs($buyer);
        $this->postJson('/api/cart', ['product_id' => $product->id, 'quantity' => 1])->assertCreated();
        $this->postJson('/api/checkout', $payload)->assertOk()->assertJsonPath('order_status', 'cancelled');
        $this->assertDatabaseCount('cart_items', 1);
        $newId = $this->postJson('/api/checkout', $this->payload())->assertCreated()->json('order_id');
        Sanctum::actingAs($admin);
        $this->postJson("/api/admin/orders/$newId/confirm-payment", ['confirmed' => true, 'reference' => 'bank-receipt-1'])->assertOk();
        $this->getJson('/api/admin/orders')->assertJsonPath('data.0.payment.verification_reference', 'bank-receipt-1')->assertJsonPath('data.0.payment.verified_by', $admin->id);
        $this->postJson("/api/admin/orders/$newId/confirm-payment", ['confirmed' => true, 'reference' => 'overwrite'])->assertConflict();
        $this->assertDatabaseHas('payments', ['order_id' => $newId, 'verification_reference' => 'bank-receipt-1']);
        Sanctum::actingAs($buyer);
        $this->getJson("/api/me/orders/$newId")->assertJsonMissingPath('payment.verification_reference');
        $product->update(['name' => 'Changed']);
        Sanctum::actingAs($seller);
        $this->getJson('/api/orders')->assertJsonPath('data.0.items.0.name', 'Original')->assertJsonMissingPath('data.0.payment');
    }
}
