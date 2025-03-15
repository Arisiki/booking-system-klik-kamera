<?php

namespace Database\Seeders;

use App\Models\Notification;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Notification::create([
            'type' => 'low_stock',
            'message' => 'Product stock is below 5!',
            'is_read' => false,
        ]);

        Notification::factory()->count(5)->create();
    }
}
