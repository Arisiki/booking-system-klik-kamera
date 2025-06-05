<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EquipmentFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->word() . ' ' . $this->faker->randomElement(['Baterai', 'Tas', 'Lensa', 'Tripod', 'Charger']),
            'description' => $this->faker->sentence(),
        ];
    }
}
