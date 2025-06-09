<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
  public function run(): void
  {

    User::create([
      'name' => 'Admin',
      'email' => 'admin@gmail.com',
      'password' => Hash::make('admin123'),
      'role' => 'admin',
      'is_active' => true,
      'image_path' => 'storage/images/users/admin.jpg',
    ]);


    User::factory()->count(5)->create([
      'role' => 'user',
      'is_active' => true,
      'image_path' => fn() => 'storage/images/users/user_' . fake()->unique()->numberBetween(1, 100) . '.jpg',
    ]);
  }
}
