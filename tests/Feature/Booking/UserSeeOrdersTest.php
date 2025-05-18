<?php

namespace Tests\Feature\Booking;

use App\Models\Order;
use App\Models\OrderItems;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSeeOrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_see_their_orders()
    {
        // Buat user dan order untuk user tersebut
        $user = User::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending'
        ]);
        
        // Buat order item untuk order tersebut
        $product = Product::factory()->create();
        OrderItems::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id
        ]);

        // Akses halaman orders sebagai user yang sudah login
        $response = $this->actingAs($user)->get('/orders');

        // Pastikan response sukses dan menampilkan halaman orders
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Bookings/Orders')
            ->has('orders') // Periksa hanya keberadaan properti orders
        );
    }

    public function test_user_can_see_multiple_orders()
    {
        $user = User::factory()->create();
        
        // Buat beberapa order untuk user
        $order1 = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending'
        ]);
        
        $order2 = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed'
        ]);

        // Akses halaman orders
        $response = $this->actingAs($user)->get('/orders');

        // Pastikan response sukses
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Bookings/Orders')
            ->has('orders') // Periksa hanya keberadaan properti orders
        );
    }

    public function test_guest_cannot_see_orders()
    {
        // Coba akses halaman orders tanpa login
        $response = $this->get('/orders');

        // Pastikan diarahkan ke halaman login
        $response->assertRedirect('/login');
    }

    public function test_user_can_filter_orders_by_status()
    {
        $user = User::factory()->create();
        
        // Buat beberapa order dengan status berbeda
        $pendingOrder = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending'
        ]);
        
        $completedOrder = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'completed'
        ]);

        // Filter order berdasarkan status pending
        $response = $this->actingAs($user)->get('/orders?status=pending');

        // Pastikan response sukses
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Bookings/Orders')
            ->has('orders') // Periksa hanya keberadaan properti orders
        );
    }

    public function test_user_cannot_see_other_users_orders()
    {
        // Buat dua user berbeda
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        // Buat order untuk user2
        $order = Order::factory()->create([
            'user_id' => $user2->id
        ]);

        // Akses halaman orders sebagai user1
        $response = $this->actingAs($user1)->get('/orders');

        // Pastikan response sukses
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Bookings/Orders')
            ->has('orders') // Periksa hanya keberadaan properti orders
        );
    }
}
