<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QualityControlChecks>
 */
class QualityControlChecksFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'type' => fake()->randomElement(['receipt', 'return', 'admin_return']),
            'condition' => $this->faker->sentence,
            'is_damaged' => $this->faker->boolean(10),
            'checked_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
