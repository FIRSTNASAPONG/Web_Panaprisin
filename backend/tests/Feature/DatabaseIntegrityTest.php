<?php
namespace Tests\Feature;

use App\Models\{User, Product, Category, Cart};
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private function row(): array
    {
        $user = User::factory()->create();
        $product = Product::create(['user_id' => $user->id, 'category_id' => Category::create(['name' => 'Test'])->id, 'name' => 'Test', 'price' => 1]);
        $cart = Cart::create(['user_id' => $user->id]);
        $cart->items()->create(['product_id' => $product->id, 'quantity' => 1]);
        return ['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 1];
    }
    public function test_database_enforces_cart_unique_and_foreign_keys(): void
    {
        $row = $this->row();
        foreach ([$row, array_replace($row, ['product_id' => 999999])] as $invalid) {
            try {
                DB::transaction(fn () => DB::table('cart_items')->insert($invalid));
                $this->fail('Database must reject duplicate or orphan rows');
            } catch (QueryException $error) {
                $this->assertNotEmpty($error->getSql());
            }
        }
        $this->assertDatabaseCount('cart_items', 1);
    }
    public function test_migration_refuses_legacy_duplicates_without_changing_rows(): void
    {
        $row = $this->row();
        Schema::table('cart_items', fn (Blueprint $table) => $table->dropUnique(['cart_id', 'product_id']));
        DB::table('cart_items')->insert($row);
        $migration = require database_path('migrations/2026_10_31_000003_harden_cart_integrity_and_lookup_indexes.php');
        try {
            $migration->up();
            $this->fail('Migration must halt on existing duplicate rows');
        } catch (\RuntimeException $error) {
            $this->assertStringContainsString('Duplicate cart_items found', $error->getMessage());
        }
        $this->assertDatabaseCount('cart_items', 2);
    }
}
