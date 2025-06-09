<?php

namespace Tests\Feature\ReviewProductUser;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserMakeProductReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_product_review()
    {
        // Buat user, product, dan order yang sudah completed
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed'
        ]);

        // Buat order item untuk order tersebut
        $orderItem = \App\Models\OrderItems::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id
        ]);

        // Data review yang akan dikirim
        $reviewData = [
            'rating' => 5,
            'comment' => 'Produk sangat bagus dan berkualitas'
        ];

        // Submit review sebagai user yang sudah login
        $response = $this->actingAs($user)->post("/orders/{$order->id}/review", $reviewData);

        // Pastikan redirect ke halaman orders dengan pesan sukses
        $response->assertRedirect(route('orders.show'));
        $response->assertSessionHas('success');

        // Pastikan review tersimpan di database
        $this->assertDatabaseHas('reviews', [
            'user_id' => $user->id,
            'order_id' => $order->id,
            'product_id' => $product->id,
            'rating' => 5,
            'comment' => 'Produk sangat bagus dan berkualitas'
        ]);
    }

    public function test_guest_cannot_submit_product_review()
    {
        // Buat order
        $order = Order::factory()->create();

        // Data review
        $reviewData = [
            'rating' => 4,
            'comment' => 'Produk bagus'
        ];

        // Coba submit review tanpa login
        $response = $this->post("/orders/{$order->id}/review", $reviewData);

        // Pastikan diarahkan ke halaman login
        $response->assertRedirect('/login');
    }

    public function test_user_cannot_review_other_users_order()
    {
        // Buat dua user berbeda
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        // Buat order untuk user2
        $product = Product::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user2->id,
            'status' => 'completed'
        ]);

        // Buat order item
        $orderItem = \App\Models\OrderItems::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id
        ]);

        // Data review
        $reviewData = [
            'rating' => 3,
            'comment' => 'Review dari user lain'
        ];

        // Coba submit review sebagai user1 untuk order milik user2
        $response = $this->actingAs($user1)->post("/orders/{$order->id}/review", $reviewData);

        // Pastikan mendapat response forbidden
        $response->assertStatus(403);
    }

    public function test_user_cannot_review_incomplete_order()
    {
        // Buat user, product, dan order dengan status pending
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending' // Order belum completed
        ]);

        // Buat order item
        $orderItem = \App\Models\OrderItems::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id
        ]);

        // Data review
        $reviewData = [
            'rating' => 5,
            'comment' => 'Review untuk order yang belum selesai'
        ];

        // Coba submit review
        $response = $this->actingAs($user)->post("/orders/{$order->id}/review", $reviewData);

        // Pastikan mendapat response error
        $response->assertStatus(400);
    }

    public function test_user_cannot_review_same_order_twice()
    {
        // Buat user, product, dan order yang sudah completed
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed'
        ]);

        // Buat order item
        $orderItem = \App\Models\OrderItems::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id
        ]);

        // Buat review yang sudah ada untuk order ini
        $existingReview = Review::factory()->create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'product_id' => $product->id,
            'rating' => 4,
            'comment' => 'Review pertama'
        ]);

        // Data review baru
        $reviewData = [
            'rating' => 5,
            'comment' => 'Review kedua'
        ];

        // Coba submit review lagi
        $response = $this->actingAs($user)->post("/orders/{$order->id}/review", $reviewData);

        // Pastikan mendapat response error
        $response->assertStatus(400);
    }

    public function test_review_validation_rules()
    {
        // Buat user, product, dan order yang sudah completed
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed'
        ]);

        // Buat order item
        $orderItem = \App\Models\OrderItems::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id
        ]);

        // Data review dengan rating invalid
        $invalidReviewData = [
            'rating' => 6, // Rating harus 1-5
            'comment' => 'Review dengan rating invalid'
        ];

        // Coba submit review dengan data invalid
        $response = $this->actingAs($user)->post("/orders/{$order->id}/review", $invalidReviewData);

        // Pastikan validasi error
        $response->assertSessionHasErrors('rating');
    }
}
