<?php
namespace Tests\Feature;

use App\Models\{User, Product, Category};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_wishlist_auth_idempotency_isolation_and_archived_product(): void
    {
        $this->getJson('/api/wishlist')->assertUnauthorized();
        $this->putJson('/api/wishlist/1')->assertUnauthorized();
        $this->deleteJson('/api/wishlist/1')->assertUnauthorized();
        $user = User::factory()->create();
        $product = Product::create(['user_id' => $user->id, 'category_id' => Category::create(['name' => 'Test'])->id, 'name' => 'Test', 'price' => 10]);
        Sanctum::actingAs($user);
        $this->putJson("/api/wishlist/$product->id", ['user_id' => 999])->assertCreated();
        $this->putJson("/api/wishlist/$product->id")->assertOk();
        $this->assertDatabaseCount('wishlist_items', 1);
        $this->getJson('/api/wishlist')->assertJsonCount(1);
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/wishlist')->assertExactJson([]);
        $this->deleteJson("/api/wishlist/$product->id")->assertNoContent();
        $this->assertDatabaseCount('wishlist_items', 1);
        $product->update(['is_active' => false]);
        $this->putJson("/api/wishlist/$product->id")->assertNotFound();
        $this->putJson('/api/wishlist/999999')->assertNotFound();
        Sanctum::actingAs($user);
        $this->deleteJson("/api/wishlist/$product->id")->assertNoContent();
        $this->assertDatabaseCount('wishlist_items', 0);
    }
}
