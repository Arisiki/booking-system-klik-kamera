<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Image>
 */
class ImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'imageable_id' => null,
            'imageable_type' => null,
            'image_path' => fake()->imageUrl(640, 480, 'camera'),
            'is_primary' => fake()->boolean(20)
        ];
    }

    //state for relations
    public function forProduct($productId)
    {
        return $this->state([
            'imageable_id' => $productId,
            'imageable_type' => Product::class,
        ]);
    }

    public function forReview($reviewId)
    {
        return $this->state([
            'imageable_id' => $reviewId,
            'imageable_type' => Review::class
        ]);
    }
}
