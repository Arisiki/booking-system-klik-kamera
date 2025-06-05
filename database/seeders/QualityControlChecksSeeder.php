<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\QualityControlChecks;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QualityControlChecksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();

        foreach ($orders as $order) {
            foreach ($order->orderItems as $item) {
                QualityControlChecks::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'type' => 'receipt',
                    'condition' => 'Good condition',
                    'is_damaged' => false,
                    'checked_at' => $order->start_date,
                ]);
                QualityControlChecks::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'type' => 'return',
                    'condition' => 'Minor wear',
                    'is_damaged' => true,
                    'checked_at' => $order->end_date,
                ]);
            }
        }
    }
}
