<?php
namespace Tests\Feature;

use App\Models\{User, Product, Category, Order, Review};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewRatingTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_purchase_moderation_duplicates_validation_and_real_average(): void
    {
        $buyer = User::factory()->create();
        $seller = User::factory()->create(['role' => 'seller']);
        $product = Product::create(['user_id' => $seller->id, 'category_id' => Category::create(['name' => 'Test'])->id, 'name' => 'Test', 'price' => 10]);
        $url = "/api/products/$product->id/reviews";
        $this->postJson($url, ['rating' => 5])->assertUnauthorized();
        $this->getJson("/api/products/$product->id")->assertJsonPath('average_rating', null)->assertJsonPath('reviews_count', 0);
        Sanctum::actingAs($seller);
        $this->postJson($url, ['rating' => 5])->assertForbidden();
        Sanctum::actingAs($buyer);
        $this->postJson($url, ['rating' => 5])->assertForbidden();
        $this->postJson($url, ['rating' => 6])->assertUnprocessable();
        $this->postJson($url, ['rating' => 0])->assertUnprocessable();
        $this->postJson($url, ['rating' => 3.5])->assertUnprocessable();
        $this->postJson($url, ['rating' => 4, 'status' => 'approved'])->assertUnprocessable();
        $order = Order::create(['user_id' => $buyer->id, 'total_amount' => 10, 'shipping_address' => 'Test', 'order_status' => 'completed']);
        $order->items()->create(['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 10, 'subtotal' => 10]);
        $payment = $order->payment()->create(['amount' => 10, 'payment_method' => 'bank_transfer', 'payment_status' => 'pending']);
        $this->postJson($url, ['rating' => 4])->assertForbidden();
        $payment->update(['payment_status' => 'completed', 'paid_at' => now()]);
        $id = $this->postJson($url, ['rating' => 4, 'comment' => 'ซื้อจริง'])->assertCreated()->assertJsonPath('review.status', 'pending')->json('review.id');
        $this->postJson($url, ['rating' => 5])->assertConflict();
        $this->getJson($url)->assertExactJson([]);
        Review::findOrFail($id)->update(['status' => 'approved']);
        $this->getJson($url)->assertJsonCount(1)->assertJsonMissingPath('0.user.email');
        $this->getJson("/api/products/$product->id")->assertJsonPath('reviews_count', 1)->assertJsonPath('average_rating', fn ($v) => (float) $v === 4.0);
        // Legacy fabricated approved reviews must never affect published ratings.
        Review::create(['product_id' => $product->id, 'user_id' => $seller->id, 'rating' => 5, 'status' => 'approved']);
        $this->getJson("/api/products/$product->id")->assertJsonPath('reviews_count', 1);
        $secondBuyer = User::factory()->create();
        $secondOrder = $order->replicate();
        $secondOrder->user_id = $secondBuyer->id;
        $secondOrder->save();
        $secondOrder->items()->create(['product_id' => $product->id, 'quantity' => 1, 'unit_price' => 10, 'subtotal' => 10]);
        $secondOrder->payment()->create(['amount' => 10, 'payment_method' => 'bank_transfer', 'payment_status' => 'completed', 'paid_at' => now()]);
        $secondReview = Review::create(['user_id' => $secondBuyer->id, 'product_id' => $product->id, 'rating' => 2, 'status' => 'approved']);
        $this->getJson("/api/products/$product->id")->assertJsonPath('reviews_count', 2)->assertJsonPath('average_rating', fn ($v) => (float) $v === 3.0);
        $secondReview->update(['status' => 'rejected']);
        $this->getJson("/api/products/$product->id")->assertJsonPath('reviews_count', 1);
        $payment->update(['payment_status' => 'failed']);
        $this->getJson("/api/products/$product->id")->assertJsonPath('average_rating', null);
    }
}
