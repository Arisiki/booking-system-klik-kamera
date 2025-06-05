<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Review;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ReviewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();

        foreach ($orders as $order) {
            $product = $order->orderItems->first()->product;
            Review::create([
                'user_id' => $order->user_id,
                'product_id' => $product->id,
                'order_id' => $order->id,
                'rating' => rand(3, 5),
                'comment' => fake()->sentence,
            ]);
        }
    }
}
