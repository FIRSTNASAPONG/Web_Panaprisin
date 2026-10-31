<?php
namespace Tests\Feature;

use App\Models\{User, Product, Category, Order};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalesReportTest extends TestCase
{
    use RefreshDatabase;
    public function test_sales_use_real_payments_status_dates_and_seller_line_totals(): void
    {
        $this->getJson('/api/reports/sales')->assertUnauthorized();
        $buyer = User::factory()->create();
        $seller = User::factory()->create(['role' => 'seller']);
        $other = User::factory()->create(['role' => 'seller']);
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($buyer);
        $this->getJson('/api/reports/sales')->assertForbidden();
        $category = Category::create(['name' => 'Test']);
        $a = Product::create(['user_id' => $seller->id, 'category_id' => $category->id, 'name' => 'A', 'price' => 999]);
        $b = Product::create(['user_id' => $other->id, 'category_id' => $category->id, 'name' => 'B', 'price' => 999]);
        foreach ([['paid','completed',30], ['shipped','completed',30], ['completed','completed',30], ['pending','completed',30], ['cancelled','completed',30], ['paid','pending',30], ['paid','failed',30], ['completed','completed',1]] as [$status,$payment,$amount]) {
            $order = Order::create(['user_id' => $buyer->id, 'total_amount' => 30, 'shipping_address' => 'Test', 'order_status' => $status]);
            foreach ([$a,$b] as $product) { $order->items()->create(['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 15, 'subtotal' => 15]); }
            $order->payment()->create(['amount' => $amount, 'payment_method' => 'bank_transfer', 'payment_status' => $payment, 'paid_at' => '2026-10-30 17:00:00']);
        }
        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/reports/sales')->assertOk()->assertJsonPath('total_orders', 3)->assertJsonPath('total_revenue', fn ($v) => (float) $v === 90.0)->assertJsonCount(2, 'top_selling_products');
        $this->getJson('/api/admin/reports/sales?from=2026-10-31&to=2026-10-31')->assertJsonPath('total_orders', 3);
        $this->getJson('/api/admin/reports/sales?from=2026-10-30&to=2026-10-30')->assertJsonPath('total_orders', 0);
        $this->getJson('/api/admin/reports/sales?from=2026-11-01&to=2026-10-01')->assertUnprocessable();
        $this->getJson('/api/admin/reports/sales?to=2026-10-31')->assertOk()->assertJsonPath('total_orders', 3);
        $this->getJson('/api/admin/reports/sales?from=bad')->assertUnprocessable();
        $a->update(['is_active' => false]);
        Sanctum::actingAs($seller);
        $this->getJson('/api/reports/sales?user_id='.$other->id)->assertOk()->assertJsonPath('total_orders', 3)->assertJsonPath('total_revenue', fn ($v) => (float) $v === 45.0)->assertJsonCount(1, 'top_selling_products')->assertJsonPath('top_selling_products.0.product_id', $a->id);
        Sanctum::actingAs(User::factory()->create(['role' => 'seller']));
        $this->getJson('/api/reports/sales')->assertJsonPath('total_orders', 0)->assertJsonCount(0, 'top_selling_products');
    }
}
