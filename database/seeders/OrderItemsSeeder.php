<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItems;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();
        $products = Product::all();

        foreach ($orders as $order) {
            $randomProducts = $products->random(rand(1, 3));
            foreach ($randomProducts as $product) {
                $days = $order->end_date->diffInDays($order->start_date);
                OrderItems::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'address' => 'penatih',
                    'pickup_method' => fake()->randomElement(['pickup', 'cod']),
                    'quantity' => rand(1, 2),
                    'rental_cost' => $product->price_per_day * $days,
                ]);
            }
            $order->update(['total_cost' => $order->orderItems->sum('rental_cost')]);
        }
    }
}
