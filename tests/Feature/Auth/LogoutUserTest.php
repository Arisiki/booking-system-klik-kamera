<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LogoutUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_logout()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_guest_cannot_logout()
    {
        $response = $this->post('/logout');

        $response->assertRedirect('/login');
    }

    public function test_user_loses_session_after_logout()
    {
        $user = User::factory()->create();
        
        $this->actingAs($user);
        $this->assertAuthenticated();
        
        $response = $this->post('/logout');
        
        $this->assertGuest();
        $this->assertNull(session('user'));
    }
}