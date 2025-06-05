<?php

namespace Database\Seeders;

use App\Models\Equipment;
use App\Models\Product;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    public function run()
    {
        if (Product::count() == 0) {
            Product::factory()->count(5)->create();
        }

        $equipment = Equipment::factory()->count(10)->create();

        $products = Product::all();


        foreach ($products as $product) {
            $randomEquipment = $equipment->random(rand(2, 5));
            foreach ($randomEquipment as $equip) {
                $product->equipment()->attach($equip->id, [
                    'quantity' => rand(1, 3),
                ]);
            }
        }
    }
}
