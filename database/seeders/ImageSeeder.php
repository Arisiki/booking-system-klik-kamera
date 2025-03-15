<?php

namespace Database\Seeders;

use App\Models\Image;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        foreach ($products as $product) {
            Image::factory()
                ->count(rand(1, 3))
                ->forProduct($product->id)
                ->create();

            Image::where('imageable_id', $product->id)
                ->where('imageable_type', Product::class)
                ->first()
                ->update(['is_primary' => true]);
        }
    }
}
