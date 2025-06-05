<?php

namespace Tests\Feature\Booking;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSeeCartTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_cart()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        // Simulasi produk di cart
        $cartItem = [
            'product_id' => $product->id,
            'quantity' => 1,
            'start_date' => now()->addDay()->format('Y-m-d'),
            'end_date' => now()->addDays(3)->format('Y-m-d'),
            'pickup_method' => 'pickup',
            'pickup_address' => 'Jl. Test No. 123',
            'user_name' => 'John Doe',
            'email' => 'john@example.com',
            'phone_number' => '081234567890',
            'rental_cost' => $product->price_per_day * 3
        ];

        session(['cart' => [$product->id => $cartItem]]);

        $response = $this->actingAs($user)->get('/cart');

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Bookings/Cart')
            ->has('cartItems', 1)
            ->has('totalCost')
        );
    }

    public function test_guest_cannot_view_cart()
    {
        $response = $this->get('/cart');

        $response->assertRedirect('/login');
    }

    public function test_empty_cart_shows_empty_message()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/cart');

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Bookings/Cart')
            ->has('cartItems', 0)
            ->where('totalCost', 0)
        );
    }

    public function test_cart_shows_correct_total_cost()
    {
        $user = User::factory()->create();
        $product1 = Product::factory()->create(['price_per_day' => 100000]);
        $product2 = Product::factory()->create(['price_per_day' => 150000]);

        // Simulasi 2 produk di cart
        $cartItems = [
            $product1->id => [
                'product_id' => $product1->id,
                'quantity' => 1,
                'start_date' => now()->addDay()->format('Y-m-d'),
                'end_date' => now()->addDays(2)->format('Y-m-d'),
                'pickup_method' => 'pickup',
                'pickup_address' => 'Jl. Test No. 123',
                'user_name' => 'John Doe',
                'email' => 'john@example.com',
                'phone_number' => '081234567890',
                'rental_cost' => $product1->price_per_day * 2
            ],
            $product2->id => [
                'product_id' => $product2->id,
                'quantity' => 2,
                'start_date' => now()->addDay()->format('Y-m-d'),
                'end_date' => now()->addDays(2)->format('Y-m-d'),
                'pickup_method' => 'pickup',
                'pickup_address' => 'Jl. Test No. 123',
                'user_name' => 'John Doe',
                'email' => 'john@example.com',
                'phone_number' => '081234567890',
                'rental_cost' => $product2->price_per_day * 2 * 2
            ]
        ];

        session(['cart' => $cartItems]);

        $response = $this->actingAs($user)->get('/cart');

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Bookings/Cart')
            ->has('cartItems', 2)
            ->where('totalCost', 800000) // (100000 * 2) + (150000 * 2 * 2)
        );
    }
}
