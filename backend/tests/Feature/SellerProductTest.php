<?php

namespace Tests\Feature;

use App\Models\{Category, Order, Product, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SellerProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_crud_authorization_validation_and_history_retention(): void
    {
        Storage::fake('public');
        $seller = User::factory()->create(['role' => 'seller']);
        $category = Category::create(['name' => 'Test']);
        $data = ['name' => 'Test product', 'description' => 'Original description', 'price' => '20.50',
            'stock_quantity' => 3, 'category_id' => $category->id];
        $this->postJson('/api/products', $data)->assertUnauthorized();
        Sanctum::actingAs(User::factory()->create());
        $this->postJson('/api/products', $data)->assertForbidden();
        Sanctum::actingAs($seller);
        $id = $this->postJson('/api/products', $data)->assertCreated()->assertJsonPath('product.description', 'Original description')->json('product.id');
        $this->patchJson("/api/products/$id", ['price' => -1])->assertUnprocessable();
        $this->patchJson("/api/products/$id", ['user_id' => $seller->id])->assertUnprocessable();
        $this->patchJson("/api/products/$id", ['image' => UploadedFile::fake()->create('bad.php', 10, 'application/x-php')])->assertUnprocessable();
        $this->postJson("/api/products/$id", ['_method' => 'PATCH', 'image' => UploadedFile::fake()->createWithContent('good.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=')), 'name' => 'Updated'])->assertOk()->assertJsonPath('product.name', 'Updated');
        Storage::disk('public')->assertExists(Product::findOrFail($id)->image_url);
        $this->getJson('/api/me/products')->assertOk()->assertJsonCount(1);
        Sanctum::actingAs(User::factory()->create(['role' => 'seller']));
        $this->getJson('/api/me/products')->assertJsonCount(0);
        $this->patchJson("/api/products/$id", ['name' => 'Intrusion'])->assertForbidden();
        $this->deleteJson("/api/products/$id")->assertForbidden();
        $buyer = User::factory()->create();
        $order = Order::create(['user_id' => $buyer->id, 'total_amount' => '20.50', 'shipping_address' => 'Test']);
        $order->items()->create(['product_id' => $id, 'quantity' => 1, 'unit_price' => '20.50', 'subtotal' => '20.50']);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->patchJson("/api/products/$id", ['description' => 'Admin update'])->assertOk();
        Sanctum::actingAs($seller);
        $this->deleteJson("/api/products/$id")->assertOk();
        $this->assertDatabaseHas('products', ['id' => $id, 'is_active' => false]);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'product_id' => $id]);
        $this->getJson("/api/products/$id")->assertNotFound();
        $this->getJson('/api/products')->assertJsonCount(0);
        Sanctum::actingAs($buyer);
        $this->postJson('/api/cart', ['product_id' => $id, 'quantity' => 1])->assertUnprocessable();
        $this->getJson("/api/me/orders/{$order->id}")->assertOk()->assertJsonCount(1, 'items');
    }
}
