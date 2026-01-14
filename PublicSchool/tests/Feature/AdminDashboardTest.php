<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = UserRole::firstOrCreate([
            'name' => 'admin',
        ], [
            'display_name' => 'Admin',
        ]);

        $this->admin = User::factory()->create([
            'user_role_id' => $adminRole->id,
        ]);
    }

    public function test_admin_dashboard_includes_announcements_widget(): void
    {
        $announcement = Announcement::factory()->create([
            'title' => 'System Maintenance',
            'published_at' => now()->subHour(),
            'is_pinned' => true,
        ]);

        Announcement::factory()->create([
            'title' => 'Unpublished Draft',
            'published_at' => null,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('announcements', 1)
            ->where('announcements.0.title', $announcement->title)
        );
    }
}
