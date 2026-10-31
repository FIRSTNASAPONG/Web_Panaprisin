<?php

namespace Tests\Feature;

use App\Models\{Category, Order, Product, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SellerCentreAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_seller_centre_scopes_admin_and_seller_to_owned_products_and_order_lines(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::create(['name' => 'Test']);
        $products = [];
        foreach ([$admin, $seller] as $owner) {
            $products[] = Product::create(['user_id' => $owner->id, 'category_id' => $category->id, 'name' => $owner->role, 'price' => 10, 'stock_quantity' => 5]);
        }
        $order = Order::create(['user_id' => $buyer->id, 'total_amount' => 20, 'shipping_address' => 'Private address', 'order_status' => 'paid']);
        foreach ($products as $product) {
            $order->items()->create(['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 10, 'subtotal' => 10]);
        }
        $order->payment()->create(['amount' => 20, 'payment_method' => 'bank_transfer', 'payment_status' => 'completed', 'paid_at' => now()]);
        foreach ([$admin, $seller] as $i => $owner) {
            Sanctum::actingAs($owner);
            $this->getJson('/api/me/products?user_id='.$buyer->id)->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $products[$i]->id);
            $this->getJson('/api/seller/orders?user_id='.$buyer->id)->assertOk()->assertJsonCount(1, 'data')->assertJsonCount(1, 'data.0.items')->assertJsonPath('data.0.items.0.product_id', $products[$i]->id)->assertJsonMissingPath('data.0.shipping_address')->assertJsonMissingPath('data.0.payment');
            $this->getJson('/api/seller/reports/sales?user_id='.$buyer->id)->assertOk()->assertJsonPath('total_orders', 1)->assertJsonPath('total_revenue', fn ($v) => (float) $v === 10.0)->assertJsonCount(1, 'top_selling_products');
            $otherProduct = $products[1 - $i];
            $this->patchJson('/api/products/'.$otherProduct->id, ['name' => 'Intrusion'])->assertForbidden();
            $this->deleteJson('/api/products/'.$otherProduct->id)->assertForbidden();
            $this->patchJson('/api/products/'.$products[$i]->id, ['name' => 'Owned update'])->assertOk();
        }
        Sanctum::actingAs($admin);
        $this->getJson('/api/orders')->assertJsonCount(1, 'data.0.items');
        $this->getJson('/api/reports/sales')->assertJsonPath('total_revenue', fn ($v) => (float) $v === 10.0);
        $this->getJson('/api/admin/reports/sales')->assertJsonPath('total_revenue', fn ($v) => (float) $v === 20.0);
        $this->getJson('/api/admin/orders')->assertOk()->assertJsonCount(2, 'data.0.items');
        $this->patchJson('/api/admin/products/'.$products[1]->id, ['name' => 'Explicit admin management'])->assertOk();
        $this->assertDatabaseHas('products', ['id' => $products[1]->id, 'is_active' => true]);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->getJson('/api/me/products')->assertJsonCount(0);
        $this->getJson('/api/seller/orders')->assertJsonCount(0, 'data');
        $this->getJson('/api/seller/reports/sales')->assertJsonPath('total_orders', 0);
    }

    public function test_guests_and_buyers_cannot_use_seller_endpoints(): void
    {
        foreach (['/api/me/products', '/api/seller/orders', '/api/seller/reports/sales', '/api/admin/reports/sales'] as $endpoint) {
            $this->getJson($endpoint)->assertUnauthorized();
        }
        Sanctum::actingAs(User::factory()->create(['role' => 'buyer']));
        foreach (['/api/me/products', '/api/seller/orders', '/api/seller/reports/sales', '/api/admin/reports/sales'] as $endpoint) {
            $this->getJson($endpoint)->assertForbidden();
        }
    }
}
