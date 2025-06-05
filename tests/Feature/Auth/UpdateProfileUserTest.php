<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UpdateProfileUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User Updated',
                'email' => 'test.updated@example.com',
            ]);

        $response->assertRedirect('/profile');
        $response->assertSessionHasNoErrors();

        $user->refresh();

        $this->assertSame('Test User Updated', $user->name);
        $this->assertSame('test.updated@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_email_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User Updated',
                'email' => $user->email,
            ]);

        $response->assertRedirect('/profile');
        $response->assertSessionHasNoErrors();

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_cannot_update_profile_with_invalid_email(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'invalid-email',
            ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_user_cannot_update_profile_with_email_that_already_exists(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $response = $this->actingAs($user1)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user2->email,
            ]);

        $response->assertSessionHasErrors('email');
    }
}