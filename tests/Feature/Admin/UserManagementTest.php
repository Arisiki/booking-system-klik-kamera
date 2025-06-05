<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_users_list()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $users = User::factory()->count(3)->create();

        $response = $this->actingAs($admin)->get('/admin/users');

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Admin/Users/Index')
            ->has('users')
            ->has('filters')
        );
    }

    public function test_admin_can_search_users()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['name' => 'John Doe']);
        User::factory()->create(['name' => 'Jane Smith']);

        $response = $this->actingAs($admin)
            ->get('/admin/users?search=John');

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Admin/Users/Index')
            ->has('users')
            ->where('filters.search', 'John')
        );
    }

    public function test_admin_can_store_new_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $userData = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'user'
        ];

        $response = $this->actingAs($admin)->post('/admin/users', $userData);

        $response->assertRedirect('/admin/users');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'role' => 'user'
        ]);
    }

    public function test_admin_can_update_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'user'
        ];

        $response = $this->actingAs($admin)
            ->put("/admin/users/{$user->id}", $updateData);

        $response->assertRedirect('/admin/users');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com'
        ]);
    }

    public function test_admin_can_delete_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $response = $this->actingAs($admin)
            ->delete("/admin/users/{$user->id}");

        $response->assertRedirect('/admin/users');
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('users', [
            'id' => $user->id
        ]);
    }

    public function test_non_admin_cannot_access_user_management()
    {
        $user = User::factory()->create(['role' => 'user']);
        $anotherUser = User::factory()->create();

        // Test semua endpoint
        $response = $this->actingAs($user)->get('/admin/users');
        $response->assertStatus(302);

        $response = $this->actingAs($user)->post('/admin/users', []);
        $response->assertStatus(302);

        $response = $this->actingAs($user)->put("/admin/users/{$anotherUser->id}", []);
        $response->assertStatus(302);

        $response = $this->actingAs($user)->delete("/admin/users/{$anotherUser->id}");
        $response->assertStatus(302);
    }
}
