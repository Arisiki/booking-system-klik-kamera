<?php

namespace Database\Factories;

use App\Models\Product; // Pastikan ini sesuai dengan model Anda
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
  protected $model = Product::class;

  public function definition()
  {
    $category = $this->faker->randomElement(['camera', 'lens', 'drone', 'flash_external', 'stabilizer', 'tripod', 'bundle']);
    $cameraType = $category === 'camera' ? $this->faker->randomElement(['dslr', 'mirrorless', 'action_camera']) : null;

    return [
      'name' => fake()->words(2, true),
      'description' => fake()->words(10, true),
      'category' => $category,
      'camera_type' => $cameraType,
      'brand' => fake()->randomElement(['canon', 'sony', 'nikon', 'fujifilm', 'lumix']),
      'price_per_day' => fake()->numberBetween(70000, 300000),
      'stock' => fake()->randomDigitNotNull(),
      'image_path' => fake()->imageUrl(640, 480, 'camera'),
    ];
  }
}
