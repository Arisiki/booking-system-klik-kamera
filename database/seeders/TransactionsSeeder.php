<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();

        foreach ($orders as $order) {
            Transaction::create([
                'order_id' => $order->id,
                'amount' => $order->total_cost,
                'payment_method' => fake()->randomElement(['bank', 'e-wallet', 'credit_card']),
                'status' => 'success',
                'is_offline' => rand(0, 1),
                'transaction_date' => $order->order_date,
            ]);
        }
    }
}
