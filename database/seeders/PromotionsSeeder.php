<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PromotionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Promotion::create([
            'code' => 'DISKON10',
            'discount_type' => 'percentage',
            'discount_value' => 10.00,
            'start_date' => now(),
            'end_date' => now()->addMonth(),
            'is_active' => true,
        ]);

        Promotion::factory()->count(3)->create();
    }
}
