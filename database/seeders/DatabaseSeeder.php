<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run()
    {
        $this->call([
            UserSeeder::class,
            ProductSeeder::class,
            EquipmentSeeder::class,
            ImageSeeder::class,
            OrderSeeder::class,
            OrderItemsSeeder::class,
            QualityControlChecksSeeder::class,
            TransactionsSeeder::class,
            ReviewsSeeder::class,
            PromotionsSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
