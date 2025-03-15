<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transactions>
 */
class TransactionsFactory extends Factory
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
            'amount' => fake()->randomFloat(2, 100000, 1000000),
            'payment_method' => fake()->randomElement(['bank', 'e-wallet', 'credit_card']),
            'status' => fake()->randomElement(['pending', 'success', 'failed']),
            'is_offline' => fake()->boolean(20),
            'transaction_date' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
