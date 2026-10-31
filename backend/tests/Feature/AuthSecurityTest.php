<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;
use Mockery;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;
    private function provider(array $raw = ['email_verified' => true], string $id = 'google-123'): void
    {
        $google = (new GoogleUser)->setRaw($raw)->map(['id' => $id, 'name' => 'Google Name', 'email' => 'buyer@example.test', 'avatar' => null]);
        $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
        $provider->shouldReceive('user')->once()->andReturn($google);
        Socialite::shouldReceive('driver')->with('google')->once()->andReturn($provider);
    }
    public function test_google_does_not_overwrite_existing_password_profile_or_role(): void
    {
        $user = User::factory()->create(['email' => 'buyer@example.test', 'first_name' => 'Local', 'role' => 'seller']);
        $password = $user->password;
        config(['services.google.frontend_url' => 'http://localhost:3100']);
        $this->provider();
        $response = $this->get('/api/auth/google/callback')->assertRedirect();
        $url = $response->headers->get('Location');
        $this->assertStringStartsWith('http://localhost:3100/auth/callback#token=', $url);
        $this->assertNull(parse_url($url, PHP_URL_QUERY));
        $this->assertSame($password, $user->fresh()->password);
        $this->assertSame('Local', $user->fresh()->first_name);
        $this->assertSame('seller', $user->fresh()->role);
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }
    public function test_unverified_google_email_cannot_link_account_or_issue_token(): void
    {
        $user = User::factory()->create(['email' => 'buyer@example.test']);
        $this->provider(['email_verified' => false]);
        $this->get('/api/auth/google/callback')->assertRedirectContains('GoogleLoginFailed');
        $this->assertNull($user->fresh()->google_id);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
    public function test_conflicting_google_identity_cannot_replace_link(): void
    {
        $user = User::factory()->create(['email' => 'buyer@example.test', 'google_id' => 'original']);
        $this->provider();
        $this->get('/api/auth/google/callback')->assertRedirectContains('GoogleLoginFailed');
        $this->assertSame('original', $user->fresh()->google_id);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
    public function test_real_socialite_rejects_missing_or_mismatched_state_before_google_request(): void
    {
        config(['services.google.client_id' => 'test', 'services.google.client_secret' => 'test', 'services.google.redirect' => 'http://localhost/api/auth/google/callback']);
        $redirect = $this->get('/api/auth/google/redirect')->assertRedirect();
        $this->assertStringContainsString('state=', $redirect->headers->get('Location'));
        $this->get('/api/auth/google/callback?code=test&state=wrong')->assertRedirectContains('GoogleLoginFailed');
        $this->get('/api/auth/google/callback?code=test')->assertRedirectContains('GoogleLoginFailed');
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
    public function test_api_rejects_session_only_but_accepts_bearer_and_logout_revokes(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'web')->getJson('/api/user')->assertUnauthorized();
        $token = $user->createToken('test')->plainTextToken;
        $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/user')->assertOk();
        $this->postJson('/api/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
    public function test_password_login_rate_limit(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/login', ['email' => 'none@example.test', 'password' => 'wrong'])->assertUnprocessable();
        }
        $this->postJson('/api/login', ['email' => 'none@example.test', 'password' => 'wrong'])->assertStatus(429);
        $this->postJson('/api/login', ['email' => 'another@example.test', 'password' => 'wrong'])->assertUnprocessable();
    }

    public function test_new_google_user_is_buyer_and_api_tokens_expire(): void
    {
        $this->provider();
        $this->get('/api/auth/google/callback')->assertRedirectContains('/auth/callback#token=');
        $user = User::firstOrFail();
        $this->assertSame('buyer', $user->role);
        $token = $user->createToken('expired', ['*'], now()->subMinute())->plainTextToken;
        $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/user')->assertUnauthorized();
    }

    public function test_web_csrf_is_not_globally_disabled(): void
    {
        \Illuminate\Support\Facades\Route::middleware('web')->post('/csrf-probe', fn () => response('ok'));
        // Laravel skips CSRF in unit mode. Switch only for this request to exercise it.
        $this->app['env'] = 'local';
        try { $this->post('/csrf-probe')->assertStatus(419); }
        finally { $this->app['env'] = 'testing'; }
    }
}
