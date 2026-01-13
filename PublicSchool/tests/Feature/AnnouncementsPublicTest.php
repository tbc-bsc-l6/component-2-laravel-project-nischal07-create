<?php

namespace Tests\Feature;

use App\Models\Announcement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementsPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_shows_published_announcements(): void
    {
        $published = Announcement::factory()->create(['published_at' => now()->subHour()]);
        $future = Announcement::factory()->create(['published_at' => now()->addDay()]);
        $draft = Announcement::factory()->create(['published_at' => null]);

        $this->get('/announcements')
            ->assertOk()
            ->assertSee($published->title)
            ->assertDontSee($future->title)
            ->assertDontSee($draft->title);
    }

    public function test_index_search_filters_results(): void
    {
        $match = Announcement::factory()->create(['title' => 'Cafeteria Menu Update', 'published_at' => now()]);
        $other = Announcement::factory()->create(['title' => 'Library Hours', 'published_at' => now()]);

        $this->get('/announcements?q=cafeteria')
            ->assertOk()
            ->assertSee($match->title)
            ->assertDontSee($other->title);
    }

    public function test_show_returns_404_for_future_or_draft(): void
    {
        $future = Announcement::factory()->create(['published_at' => now()->addDay()]);
        $draft = Announcement::factory()->create(['published_at' => null]);
        $published = Announcement::factory()->create(['published_at' => now()]);

        $this->get('/announcements/' . $future->id)->assertNotFound();
        $this->get('/announcements/' . $draft->id)->assertNotFound();
        $this->get('/announcements/' . $published->id)->assertOk()->assertSee($published->title);
    }
}
