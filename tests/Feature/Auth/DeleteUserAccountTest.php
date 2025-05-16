<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeleteUserAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_delete_their_account()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile', [
                'password' => 'password',
                '_method' => 'delete',
            ]);

        $this->assertGuest();
        $this->assertNull(User::find($user->id));
        $response->assertRedirect('/');
    }

    public function test_correct_password_must_be_provided_before_account_deletion()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile', [
                'password' => 'wrong-password',
                '_method' => 'delete',
            ]);

        $response->assertSessionHasErrors('password');
        $this->assertNotNull(User::find($user->id));
    }

    public function test_guest_cannot_delete_account()
    {
        $response = $this->post('/profile', [
            'password' => 'password',
            '_method' => 'delete',
        ]);

        $response->assertRedirect('/login');
    }

    public function test_user_session_is_invalidated_after_deletion()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile', [
                'password' => 'password',
                '_method' => 'delete',
            ]);

        $this->assertNull(session('user'));
        $this->assertGuest();
    }
}