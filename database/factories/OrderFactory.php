<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Orders>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+2 months');

        return [
            'user_id' => User::factory(),
            'order_date' => now(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'pickup_method' => fake()->randomElement(['home_delivery', 'pickup']),
            'total_cost' => fake()->numberBetween(100000, 600000),
            'status' => fake()->randomElement(['pending', 'booked', 'awaiting return', 'completed', 'cancelled'])
        ];
    }
}
